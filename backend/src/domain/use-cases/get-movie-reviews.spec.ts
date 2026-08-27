import { describe, it, expect, beforeEach } from "vitest";
import { GetMovieReviewsUseCase } from "./get-movie-reviews.js";
import { InMemoryUsersRepository } from "../../test/repositories/in-memory-users-repository.js";
import { InMemoryReviewsRepository } from "../../test/repositories/in-memory-reviews-repository.js";
import { User } from "../entities/user.js";
import { Review } from "../entities/review.js";

let usersRepository: InMemoryUsersRepository;
let reviewsRepository: InMemoryReviewsRepository;
let sut: GetMovieReviewsUseCase;

describe("Get Movie Reviews Use Case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    reviewsRepository = new InMemoryReviewsRepository(usersRepository);
    sut = new GetMovieReviewsUseCase(reviewsRepository);
  });

  it("should return only reviews for the requested movie and media type, with author info", async () => {
    const user = await usersRepository.create(
      new User({ username: "artur", email: "artur@example.com", passwordHash: "hash" })
    );

    await reviewsRepository.create(new Review({ userId: user.id, tmdbId: "550", mediaType: "movie", rating: 5 }));
    await reviewsRepository.create(new Review({ userId: user.id, tmdbId: "550", mediaType: "tv", rating: 4 })); // different media type, should not match
    await reviewsRepository.create(new Review({ userId: user.id, tmdbId: "999", mediaType: "movie", rating: 3 })); // different movie, should not match

    const result = await sut.execute({ tmdbId: "550", mediaType: "movie", page: 1, perPage: 10 });

    expect(result.reviews.total).toBe(1);
    expect(result.reviews.items).toHaveLength(1);
    expect(result.reviews.items[0].author.username).toBe("artur");
  });

  it("should paginate results", async () => {
    const user = await usersRepository.create(
      new User({ username: "artur", email: "artur@example.com", passwordHash: "hash" })
    );

    for (let i = 1; i <= 5; i++) {
      await reviewsRepository.create(new Review({ userId: user.id, tmdbId: "550", mediaType: "movie", rating: 4 }));
    }

    const firstPage = await sut.execute({ tmdbId: "550", mediaType: "movie", page: 1, perPage: 2 });
    const secondPage = await sut.execute({ tmdbId: "550", mediaType: "movie", page: 2, perPage: 2 });

    expect(firstPage.reviews.total).toBe(5);
    expect(firstPage.reviews.items).toHaveLength(2);
    expect(secondPage.reviews.items).toHaveLength(2);
    expect(firstPage.reviews.items[0].id).not.toBe(secondPage.reviews.items[0].id);
  });
});
