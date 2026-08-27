import { describe, it, expect, beforeEach } from "vitest";
import { GetUserProfileUseCase } from "./get-user-profile.js";
import { InMemoryUsersRepository } from "../../test/repositories/in-memory-users-repository.js";
import { InMemoryReviewsRepository } from "../../test/repositories/in-memory-reviews-repository.js";
import { InMemoryVotesRepository } from "../../test/repositories/in-memory-votes-repository.js";
import { InMemoryBadgesRepository } from "../../test/repositories/in-memory-badges-repository.js";
import { InMemoryUserBadgesRepository } from "../../test/repositories/in-memory-user-badges-repository.js";
import { User } from "../entities/user.js";
import { Review } from "../entities/review.js";
import { Vote } from "../entities/vote.js";
import { Badge } from "../entities/badge.js";
import { UserNotFoundError } from "../errors/user-not-found-error.js";

let usersRepository: InMemoryUsersRepository;
let reviewsRepository: InMemoryReviewsRepository;
let votesRepository: InMemoryVotesRepository;
let badgesRepository: InMemoryBadgesRepository;
let userBadgesRepository: InMemoryUserBadgesRepository;
let sut: GetUserProfileUseCase;

describe("Get User Profile Use Case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    reviewsRepository = new InMemoryReviewsRepository(usersRepository);
    votesRepository = new InMemoryVotesRepository(reviewsRepository);
    badgesRepository = new InMemoryBadgesRepository();
    userBadgesRepository = new InMemoryUserBadgesRepository(badgesRepository);
    sut = new GetUserProfileUseCase(usersRepository, reviewsRepository, votesRepository, userBadgesRepository);
  });

  it("should throw when the username does not exist", async () => {
    await expect(sut.execute({ username: "ghost", page: 1, perPage: 10 })).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it("should return the public profile with score, badges and paginated reviews", async () => {
    const user = await usersRepository.create(
      new User({ username: "artur", email: "artur@example.com", passwordHash: "hash" })
    );

    for (let i = 1; i <= 3; i++) {
      await reviewsRepository.create(
        new Review({ userId: user.id, tmdbId: `movie-${i}`, mediaType: "movie", rating: 5 })
      );
    }

    await votesRepository.create(
      new Vote({ userId: "someone-else", reviewId: reviewsRepository.items[0].id, type: "upvote" })
    );

    const badge = await badgesRepository.create(
      new Badge({ name: "Rookie", description: "First review", iconUrl: "https://cdn/rookie.png" })
    );
    await userBadgesRepository.create(user.id, badge.id);

    const result = await sut.execute({ username: "artur", page: 1, perPage: 2 });

    expect(result.profile.username).toBe("artur");
    expect(result.profile.score).toBe(3 * 2 + 1 * 5); // 3 reviews + 1 upvote
    expect(result.profile.badges.map((b) => b.name)).toContain("Rookie");
    expect(result.reviews.total).toBe(3);
    expect(result.reviews.items).toHaveLength(2); // perPage = 2
  });
});
