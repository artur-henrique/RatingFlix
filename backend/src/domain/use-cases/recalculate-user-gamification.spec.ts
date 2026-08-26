import { describe, it, expect, beforeEach } from "vitest";
import { randomUUID } from "node:crypto";
import { RecalculateUserGamificationUseCase, BADGE_RULES } from "./recalculate-user-gamification.js";
import { InMemoryReviewsRepository } from "../../test/repositories/in-memory-reviews-repository.js";
import { InMemoryVotesRepository } from "../../test/repositories/in-memory-votes-repository.js";
import { InMemoryBadgesRepository } from "../../test/repositories/in-memory-badges-repository.js";
import { InMemoryUserBadgesRepository } from "../../test/repositories/in-memory-user-badges-repository.js";
import { Review } from "../entities/review.js";
import { Vote } from "../entities/vote.js";
import { Badge } from "../entities/badge.js";

let reviewsRepository: InMemoryReviewsRepository;
let votesRepository: InMemoryVotesRepository;
let badgesRepository: InMemoryBadgesRepository;
let userBadgesRepository: InMemoryUserBadgesRepository;
let sut: RecalculateUserGamificationUseCase; // System Under Test

describe("Recalculate User Gamification Use Case", () => {
  beforeEach(async () => {
    reviewsRepository = new InMemoryReviewsRepository();
    votesRepository = new InMemoryVotesRepository(reviewsRepository);
    badgesRepository = new InMemoryBadgesRepository();
    userBadgesRepository = new InMemoryUserBadgesRepository(badgesRepository);
    sut = new RecalculateUserGamificationUseCase(
      reviewsRepository,
      votesRepository,
      badgesRepository,
      userBadgesRepository
    );

    // Seed system badges matching BADGE_RULES
    for (const rule of BADGE_RULES) {
      await badgesRepository.create(
        new Badge({
          name: rule.name,
          description: `You reached the ${rule.name} tier!`,
          iconUrl: `https://cdn.ratingflix.com/badges/${rule.name.toLowerCase()}.png`,
        })
      );
    }
  });

  it("should award Rookie badge when user creates their first review", async () => {
    const userId = randomUUID();

    // No reviews yet
    let result = await sut.execute({ userId });
    expect(result.score).toBe(0);
    expect(result.qualifiedBadges).toStrictEqual([]);

    // Create 1 review
    await reviewsRepository.create(
      new Review({
        userId,
        tmdbId: "550",
        mediaType: "movie",
        rating: 5,
        content: "Love this!",
      })
    );

    result = await sut.execute({ userId });
    expect(result.score).toBe(2); // 1 review * 2 points = 2 score
    expect(result.qualifiedBadges).toContain("Rookie");
    expect(result.qualifiedBadges).not.toContain("Prestige");

    const activeBadges = await userBadgesRepository.findManyByUserId(userId);
    expect(activeBadges.map((b) => b.name)).toContain("Rookie");
  });

  it("should upgrade user tier as they post reviews and receive positive upvotes", async () => {
    const userId = randomUUID();

    // Create 3 reviews (qualifies for Prestige if score >= 5, here score = 6)
    for (let i = 1; i <= 3; i++) {
      await reviewsRepository.create(
        new Review({
          userId,
          tmdbId: `movie-${i}`,
          mediaType: "movie",
          rating: 4,
        })
      );
    }

    let result = await sut.execute({ userId });
    expect(result.score).toBe(6); // 3 reviews * 2 = 6 score
    expect(result.qualifiedBadges).toContain("Rookie");
    expect(result.qualifiedBadges).toContain("Prestige");

    // Add upvotes to user's first review to boost their score and upvotes count
    const reviewId = reviewsRepository.items[0].id;
    for (let i = 1; i <= 2; i++) {
      await votesRepository.create(
        new Vote({
          userId: randomUUID(),
          reviewId,
          type: "upvote",
        })
      );
    }

    result = await sut.execute({ userId });
    expect(result.score).toBe(16); // 3 reviews (6) + 2 upvotes * 5 (10) = 16 score
    expect(result.qualifiedBadges).not.toContain("Forrest"); // Forrest needs minReviews: 5. They only have 3, so they DO NOT qualify!
  });

  it("should automatically demote / remove badges (downgrade) if user's activity drops drastically", async () => {
    const userId = randomUUID();

    // 1. User posts 12 reviews (qualifies for Matrix and Morpheus)
    // Morpheus requires minReviews: 12, minRecentReviews: 1
    for (let i = 1; i <= 12; i++) {
      await reviewsRepository.create(
        new Review({
          userId,
          tmdbId: `show-${i}`,
          mediaType: "tv",
          rating: 5,
          createdAt: new Date(), // recent review
        })
      );
    }

    let result = await sut.execute({ userId });
    expect(result.score).toBe(24); // 12 reviews * 2 = 24 score. Oh, Morpheus needs minScore: 50. Let's add upvotes to reach 50!
    
    // Add 6 upvotes (30 points) to push score to 54
    const reviewId = reviewsRepository.items[0].id;
    for (let i = 1; i <= 6; i++) {
      await votesRepository.create(
        new Vote({
          userId: randomUUID(),
          reviewId,
          type: "upvote",
        })
      );
    }

    result = await sut.execute({ userId });
    expect(result.score).toBe(54); // 24 + 30 = 54
    expect(result.qualifiedBadges).toContain("Morpheus");

    let activeBadges = await userBadgesRepository.findManyByUserId(userId);
    expect(activeBadges.map((b) => b.name)).toContain("Morpheus");

    // 2. INACTIVITY SCENARIO: 31 days pass. All their reviews are now older than 30 days.
    const fortyDaysAgo = new Date();
    fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40);

    for (const review of reviewsRepository.items) {
      // Force change review dates in our in-memory db to simulate time passing
      (review as any).props.createdAt = fortyDaysAgo;
    }

    // Recalculate - user no longer has any "recent" reviews (recentReviews = 0)
    // Morpheus rule: minRecentReviews: 1. They should fail Morpheus but keep Matrix!
    result = await sut.execute({ userId });
    expect(result.qualifiedBadges).not.toContain("Morpheus");
    expect(result.qualifiedBadges).toContain("Matrix");

    // Verify badge was physically deleted from their profile
    activeBadges = await userBadgesRepository.findManyByUserId(userId);
    expect(activeBadges.map((b) => b.name)).not.toContain("Morpheus");
    expect(activeBadges.map((b) => b.name)).toContain("Matrix");
  });
});
