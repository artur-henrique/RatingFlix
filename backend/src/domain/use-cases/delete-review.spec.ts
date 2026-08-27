import { describe, it, expect, beforeEach } from "vitest";
import { randomUUID } from "node:crypto";
import { DeleteReviewUseCase } from "./delete-review.js";
import { RecalculateUserGamificationUseCase } from "./recalculate-user-gamification.js";
import { InMemoryReviewsRepository } from "../../test/repositories/in-memory-reviews-repository.js";
import { InMemoryVotesRepository } from "../../test/repositories/in-memory-votes-repository.js";
import { InMemoryBadgesRepository } from "../../test/repositories/in-memory-badges-repository.js";
import { InMemoryUserBadgesRepository } from "../../test/repositories/in-memory-user-badges-repository.js";
import { Review } from "../entities/review.js";
import { ReviewNotFoundError } from "../errors/review-not-found-error.js";
import { NotReviewOwnerError } from "../errors/not-review-owner-error.js";

let reviewsRepository: InMemoryReviewsRepository;
let sut: DeleteReviewUseCase;

describe("Delete Review Use Case", () => {
  beforeEach(() => {
    reviewsRepository = new InMemoryReviewsRepository();
    const votesRepository = new InMemoryVotesRepository(reviewsRepository);
    const badgesRepository = new InMemoryBadgesRepository();
    const userBadgesRepository = new InMemoryUserBadgesRepository(badgesRepository);
    const recalculateUserGamificationUseCase = new RecalculateUserGamificationUseCase(
      reviewsRepository,
      votesRepository,
      badgesRepository,
      userBadgesRepository
    );
    sut = new DeleteReviewUseCase(reviewsRepository, recalculateUserGamificationUseCase);
  });

  it("should let the author delete their own review", async () => {
    const authorId = randomUUID();
    const review = await reviewsRepository.create(
      new Review({ userId: authorId, tmdbId: "550", mediaType: "movie", rating: 3 })
    );

    await sut.execute({ reviewId: review.id, userId: authorId });

    expect(await reviewsRepository.findById(review.id)).toBeNull();
  });

  it("should not let another user delete someone else's review", async () => {
    const authorId = randomUUID();
    const otherUserId = randomUUID();
    const review = await reviewsRepository.create(
      new Review({ userId: authorId, tmdbId: "550", mediaType: "movie", rating: 3 })
    );

    await expect(sut.execute({ reviewId: review.id, userId: otherUserId })).rejects.toBeInstanceOf(
      NotReviewOwnerError
    );
    expect(await reviewsRepository.findById(review.id)).not.toBeNull();
  });

  it("should throw when the review does not exist", async () => {
    await expect(sut.execute({ reviewId: randomUUID(), userId: randomUUID() })).rejects.toBeInstanceOf(
      ReviewNotFoundError
    );
  });
});
