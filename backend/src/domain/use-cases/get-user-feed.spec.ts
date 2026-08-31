import { describe, it, expect, beforeEach } from "vitest";
import { GetUserFeedUseCase } from "./get-user-feed.js";
import { InMemoryFollowsRepository } from "../../test/repositories/in-memory-follows-repository.js";
import { InMemoryReviewsRepository } from "../../test/repositories/in-memory-reviews-repository.js";
import { InMemoryUsersRepository } from "../../test/repositories/in-memory-users-repository.js";
import { InMemoryVotesRepository } from "../../test/repositories/in-memory-votes-repository.js";
import { User } from "../entities/user.js";
import { Review } from "../entities/review.js";

let followsRepository: InMemoryFollowsRepository;
let reviewsRepository: InMemoryReviewsRepository;
let usersRepository: InMemoryUsersRepository;
let votesRepository: InMemoryVotesRepository;
let sut: GetUserFeedUseCase;

describe("Get User Feed Use Case", () => {
  beforeEach(() => {
    followsRepository = new InMemoryFollowsRepository();
    usersRepository = new InMemoryUsersRepository();
    reviewsRepository = new InMemoryReviewsRepository(usersRepository);
    votesRepository = new InMemoryVotesRepository(reviewsRepository);
    sut = new GetUserFeedUseCase(followsRepository, reviewsRepository, votesRepository);
  });

  it("should return an empty feed when the user follows no one", async () => {
    const me = await usersRepository.create(
      new User({ username: "me", email: "me@example.com", passwordHash: "hash" })
    );

    const result = await sut.execute({ userId: me.id, page: 1, perPage: 10 });

    expect(result.reviews).toStrictEqual({ items: [], total: 0, page: 1, perPage: 10 });
  });

  it("should only show reviews from users being followed, most recent first", async () => {
    const me = await usersRepository.create(
      new User({ username: "me", email: "me@example.com", passwordHash: "hash" })
    );
    const followedCritic = await usersRepository.create(
      new User({ username: "critic", email: "critic@example.com", passwordHash: "hash" })
    );
    const strangerCritic = await usersRepository.create(
      new User({ username: "stranger", email: "stranger@example.com", passwordHash: "hash" })
    );

    await followsRepository.follow(me.id, followedCritic.id);

    const olderReview = await reviewsRepository.create(
      new Review({
        userId: followedCritic.id,
        tmdbId: "550",
        mediaType: "movie",
        rating: 5,
        createdAt: new Date("2026-01-01"),
      })
    );
    const newerReview = await reviewsRepository.create(
      new Review({
        userId: followedCritic.id,
        tmdbId: "27205",
        mediaType: "movie",
        rating: 4,
        createdAt: new Date("2026-02-01"),
      })
    );
    // Review from a critic the user does NOT follow — must not show up in the feed
    await reviewsRepository.create(
      new Review({ userId: strangerCritic.id, tmdbId: "999", mediaType: "movie", rating: 3 })
    );

    const result = await sut.execute({ userId: me.id, page: 1, perPage: 10 });

    expect(result.reviews.total).toBe(2);
    expect(result.reviews.items.map((r) => r.id)).toStrictEqual([newerReview.id, olderReview.id]);
    expect(result.reviews.items.every((r) => r.author.id === followedCritic.id)).toBe(true);
  });
});
