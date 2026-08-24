import { describe, it, expect, beforeEach } from "vitest";
import { randomUUID } from "node:crypto";
import { CreateReviewUseCase } from "./create-review.js";
import { InMemoryReviewsRepository } from "../../test/repositories/in-memory-reviews-repository.js";
import { ReviewAlreadyExistsError } from "../errors/review-already-exists-error.js";

let reviewsRepository: InMemoryReviewsRepository;
let sut: CreateReviewUseCase; // System Under Test

describe("Create Review Use Case", () => {
  beforeEach(() => {
    reviewsRepository = new InMemoryReviewsRepository();
    sut = new CreateReviewUseCase(reviewsRepository);
  });

  it("should be able to create a new movie review", async () => {
    const userId = randomUUID();
    const { review } = await sut.execute({
      userId,
      tmdbId: "550", // Fight Club TMDB id
      mediaType: "movie",
      rating: 5,
      content: "An absolute masterpiece. Deep sociological analysis of consumerism.",
    });

    expect(review.id).toStrictEqual(expect.any(String));
    expect(review.userId).toBe(userId);
    expect(review.tmdbId).toBe("550");
    expect(review.rating).toBe(5);
    expect(review.content).toBe("An absolute masterpiece. Deep sociological analysis of consumerism.");
  });

  it("should not be able to create two reviews for the same media by the same user", async () => {
    const userId = randomUUID();

    await sut.execute({
      userId,
      tmdbId: "550",
      mediaType: "movie",
      rating: 4,
      content: "First review.",
    });

    await expect(() =>
      sut.execute({
        userId,
        tmdbId: "550",
        mediaType: "movie",
        rating: 5,
        content: "Second review try.",
      })
    ).rejects.toBeInstanceOf(ReviewAlreadyExistsError);
  });

  it("should validate rating range limits (1-5)", async () => {
    const userId = randomUUID();

    await expect(() =>
      sut.execute({
        userId,
        tmdbId: "550",
        mediaType: "movie",
        rating: 6, // too high
        content: "Amazing!",
      })
    ).rejects.toThrow();

    await expect(() =>
      sut.execute({
        userId,
        tmdbId: "550",
        mediaType: "movie",
        rating: 0, // too low
        content: "Terrible!",
      })
    ).rejects.toThrow();
  });
});
