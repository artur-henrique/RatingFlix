import { describe, it, expect, beforeEach } from "vitest";
import { randomUUID } from "node:crypto";
import { VoteOnReviewUseCase } from "./vote-on-review.js";
import { RecalculateUserGamificationUseCase } from "./recalculate-user-gamification.js";
import { InMemoryReviewsRepository } from "../../test/repositories/in-memory-reviews-repository.js";
import { InMemoryVotesRepository } from "../../test/repositories/in-memory-votes-repository.js";
import { InMemoryBadgesRepository } from "../../test/repositories/in-memory-badges-repository.js";
import { InMemoryUserBadgesRepository } from "../../test/repositories/in-memory-user-badges-repository.js";
import { Review } from "../entities/review.js";
import { SelfVotingError } from "../errors/self-voting-error.js";

let reviewsRepository: InMemoryReviewsRepository;
let votesRepository: InMemoryVotesRepository;
let badgesRepository: InMemoryBadgesRepository;
let userBadgesRepository: InMemoryUserBadgesRepository;
let recalculateUserGamificationUseCase: RecalculateUserGamificationUseCase;
let sut: VoteOnReviewUseCase; // System Under Test

describe("Vote On Review Use Case", () => {
  beforeEach(() => {
    reviewsRepository = new InMemoryReviewsRepository();
    votesRepository = new InMemoryVotesRepository(reviewsRepository);
    badgesRepository = new InMemoryBadgesRepository();
    userBadgesRepository = new InMemoryUserBadgesRepository(badgesRepository);
    recalculateUserGamificationUseCase = new RecalculateUserGamificationUseCase(
      reviewsRepository,
      votesRepository,
      badgesRepository,
      userBadgesRepository
    );
    sut = new VoteOnReviewUseCase(votesRepository, reviewsRepository, recalculateUserGamificationUseCase);
  });

  it("should register a new upvote on someone else's review", async () => {
    const authorId = randomUUID();
    const voterId = randomUUID();

    const review = await reviewsRepository.create(
      new Review({ userId: authorId, tmdbId: "550", mediaType: "movie", rating: 5 })
    );

    const result = await sut.execute({ userId: voterId, reviewId: review.id, type: "upvote" });

    expect(result).toStrictEqual({ voted: true, type: "upvote" });
    expect(votesRepository.items).toHaveLength(1);
    expect(votesRepository.items[0].type).toBe("upvote");
  });

  it("should toggle the vote off when voting the same type twice", async () => {
    const authorId = randomUUID();
    const voterId = randomUUID();

    const review = await reviewsRepository.create(
      new Review({ userId: authorId, tmdbId: "550", mediaType: "movie", rating: 5 })
    );

    await sut.execute({ userId: voterId, reviewId: review.id, type: "upvote" });
    const result = await sut.execute({ userId: voterId, reviewId: review.id, type: "upvote" });

    expect(result).toStrictEqual({ voted: false, type: null });
    expect(votesRepository.items).toHaveLength(0);
  });

  it("should switch the vote type when voting differently", async () => {
    const authorId = randomUUID();
    const voterId = randomUUID();

    const review = await reviewsRepository.create(
      new Review({ userId: authorId, tmdbId: "550", mediaType: "movie", rating: 5 })
    );

    await sut.execute({ userId: voterId, reviewId: review.id, type: "upvote" });
    const result = await sut.execute({ userId: voterId, reviewId: review.id, type: "downvote" });

    expect(result).toStrictEqual({ voted: true, type: "downvote" });
    expect(votesRepository.items).toHaveLength(1);
    expect(votesRepository.items[0].type).toBe("downvote");
  });

  it("should not allow a user to vote on their own review", async () => {
    const authorId = randomUUID();

    const review = await reviewsRepository.create(
      new Review({ userId: authorId, tmdbId: "550", mediaType: "movie", rating: 5 })
    );

    await expect(sut.execute({ userId: authorId, reviewId: review.id, type: "upvote" })).rejects.toBeInstanceOf(
      SelfVotingError
    );
    expect(votesRepository.items).toHaveLength(0);
  });

  it("should throw when the review does not exist", async () => {
    await expect(
      sut.execute({ userId: randomUUID(), reviewId: randomUUID(), type: "upvote" })
    ).rejects.toThrow("Review not found.");
  });

  it("should trigger gamification recalculation for the review owner after voting", async () => {
    const authorId = randomUUID();
    const voterId = randomUUID();

    const review = await reviewsRepository.create(
      new Review({ userId: authorId, tmdbId: "550", mediaType: "movie", rating: 5 })
    );

    await sut.execute({ userId: voterId, reviewId: review.id, type: "upvote" });

    // 1 review (2 pts) + 1 upvote (5 pts) = 7 pts for the review author
    const gamification = await recalculateUserGamificationUseCase.execute({ userId: authorId });
    expect(gamification.score).toBe(7);
  });
});
