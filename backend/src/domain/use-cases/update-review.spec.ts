import { describe, it, expect, beforeEach } from "vitest";
import { randomUUID } from "node:crypto";
import { UpdateReviewUseCase } from "./update-review.js";
import { InMemoryReviewsRepository } from "../../test/repositories/in-memory-reviews-repository.js";
import { Review } from "../entities/review.js";
import { ReviewNotFoundError } from "../errors/review-not-found-error.js";
import { NotReviewOwnerError } from "../errors/not-review-owner-error.js";

let reviewsRepository: InMemoryReviewsRepository;
let sut: UpdateReviewUseCase;

describe("Update Review Use Case", () => {
  beforeEach(() => {
    reviewsRepository = new InMemoryReviewsRepository();
    sut = new UpdateReviewUseCase(reviewsRepository);
  });

  it("should let the author edit rating and content", async () => {
    const authorId = randomUUID();
    const review = await reviewsRepository.create(
      new Review({ userId: authorId, tmdbId: "550", mediaType: "movie", rating: 3, content: "Meh." })
    );

    const { review: updated } = await sut.execute({
      reviewId: review.id,
      userId: authorId,
      rating: 5,
      content: "Actually, this is a masterpiece.",
    });

    expect(updated.rating).toBe(5);
    expect(updated.content).toBe("Actually, this is a masterpiece.");
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(updated.createdAt.getTime());
  });

  it("should not let another user edit someone else's review", async () => {
    const authorId = randomUUID();
    const otherUserId = randomUUID();
    const review = await reviewsRepository.create(
      new Review({ userId: authorId, tmdbId: "550", mediaType: "movie", rating: 3 })
    );

    await expect(
      sut.execute({ reviewId: review.id, userId: otherUserId, rating: 1, content: "Hijacked!" })
    ).rejects.toBeInstanceOf(NotReviewOwnerError);
  });

  it("should throw when the review does not exist", async () => {
    await expect(
      sut.execute({ reviewId: randomUUID(), userId: randomUUID(), rating: 5, content: null })
    ).rejects.toBeInstanceOf(ReviewNotFoundError);
  });
});
