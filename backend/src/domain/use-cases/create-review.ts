import { z } from "zod";
import { Review } from "../entities/review.js";
import { ReviewsRepository } from "../repositories/reviews-repository.js";
import { ReviewAlreadyExistsError } from "../errors/review-already-exists-error.js";
import { RecalculateUserGamificationUseCase } from "./recalculate-user-gamification.js";
import { MovieService } from "../services/movie-service.js";

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
  constructor(
    private reviewsRepository: ReviewsRepository,
    private recalculateUserGamificationUseCase: RecalculateUserGamificationUseCase,
    private movieService: MovieService
  ) {}

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

    // Snapshot de título/pôster resolvido uma única vez aqui, na criação —
    // falha ao consultar o TMDB não pode impedir a crítica de ser salva,
    // então a review é criada sem o snapshot (title/posterPath nulos) e
    // o card exibido sem essas informações, em vez de propagar o erro.
    let movieTitle: string | null = null;
    let moviePosterPath: string | null = null;
    try {
      const movieDetails = await this.movieService.getMovieDetails(data.tmdbId, data.mediaType);
      movieTitle = movieDetails?.title ?? null;
      moviePosterPath = movieDetails?.posterPath ?? null;
    } catch (error) {
      console.error("Failed to fetch movie snapshot for review creation:", error);
    }

    const review = new Review({
      userId: data.userId,
      tmdbId: data.tmdbId,
      mediaType: data.mediaType,
      rating: data.rating,
      content: data.content,
      movieTitle,
      moviePosterPath,
    });

    await this.reviewsRepository.create(review);

    // Creating a review changes the author's review count, which affects their score/badges
    await this.recalculateUserGamificationUseCase.execute({ userId: data.userId });

    return { review };
  }
}
