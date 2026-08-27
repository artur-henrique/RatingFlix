import { z } from "zod";
import { ReviewsRepository } from "../repositories/reviews-repository.js";
import { RecalculateUserGamificationUseCase } from "./recalculate-user-gamification.js";
import { ReviewNotFoundError } from "../errors/review-not-found-error.js";
import { NotReviewOwnerError } from "../errors/not-review-owner-error.js";

const deleteReviewSchema = z.object({
  reviewId: z.string().uuid("Invalid review ID format"),
  userId: z.string().uuid("Invalid user ID format"),
});

type DeleteReviewRequest = z.infer<typeof deleteReviewSchema>;

export class DeleteReviewUseCase {
  constructor(
    private reviewsRepository: ReviewsRepository,
    private recalculateUserGamificationUseCase: RecalculateUserGamificationUseCase
  ) {}

  async execute(request: DeleteReviewRequest): Promise<void> {
    const data = deleteReviewSchema.parse(request);

    const review = await this.reviewsRepository.findById(data.reviewId);
    if (!review) {
      throw new ReviewNotFoundError();
    }

    if (review.userId !== data.userId) {
      throw new NotReviewOwnerError();
    }

    await this.reviewsRepository.delete(data.reviewId);

    await this.recalculateUserGamificationUseCase.execute({ userId: data.userId });
  }
}
