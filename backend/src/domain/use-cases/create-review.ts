import { z } from "zod";
import { Review } from "../entities/review.js";
import { ReviewsRepository } from "../repositories/reviews-repository.js";
import { ReviewAlreadyExistsError } from "../errors/review-already-exists-error.js";

const createReviewSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  tmdbId: z.string().min(1, "TMDB ID is required"),
  mediaType: z.enum(["movie", "tv"]),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot be more than 5"),
  content: z.string().max(2000, "Review content cannot exceed 2000 characters").nullable().optional(),
});

type CreateReviewRequest = z.infer<typeof createReviewSchema>;

interface CreateReviewResponse {
  review: Review;
}

export class CreateReviewUseCase {
  constructor(private reviewsRepository: ReviewsRepository) {}

  async execute(request: CreateReviewRequest): Promise<CreateReviewResponse> {
    const data = createReviewSchema.parse(request);

    // Enforce uniqueness constraint: One review per user, per movie/tv
    const existingReview = await this.reviewsRepository.findByUserAndMedia(
      data.userId,
      data.tmdbId,
      data.mediaType
    );

    if (existingReview) {
      throw new ReviewAlreadyExistsError();
    }

    const review = new Review({
      userId: data.userId,
      tmdbId: data.tmdbId,
      mediaType: data.mediaType,
      rating: data.rating,
      content: data.content,
    });

    await this.reviewsRepository.create(review);

    return { review };
  }
}
