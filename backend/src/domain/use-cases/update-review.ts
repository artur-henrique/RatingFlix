import { z } from "zod";
import { Review } from "../entities/review.js";
import { ReviewsRepository } from "../repositories/reviews-repository.js";
import { ReviewNotFoundError } from "../errors/review-not-found-error.js";
import { NotReviewOwnerError } from "../errors/not-review-owner-error.js";

const updateReviewSchema = z.object({
  reviewId: z.string().uuid("Invalid review ID format"),
  userId: z.string().uuid("Invalid user ID format"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot be more than 5"),
  content: z.string().max(2000, "Review content cannot exceed 2000 characters").nullable().optional(),
});

type UpdateReviewRequest = z.infer<typeof updateReviewSchema>;

interface UpdateReviewResponse {
  review: Review;
}

export class UpdateReviewUseCase {
  constructor(private reviewsRepository: ReviewsRepository) {}

  async execute(request: UpdateReviewRequest): Promise<UpdateReviewResponse> {
    const data = updateReviewSchema.parse(request);

    const review = await this.reviewsRepository.findById(data.reviewId);
    if (!review) {
      throw new ReviewNotFoundError();
    }

    if (review.userId !== data.userId) {
      throw new NotReviewOwnerError();
    }

    // Rating/content don't affect review count, so no gamification recalculation is needed here.
    review.updateRatingAndContent(data.rating, data.content);
    await this.reviewsRepository.save(review);

    return { review };
  }
}
