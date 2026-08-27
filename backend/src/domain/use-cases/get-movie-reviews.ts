import { z } from "zod";
import { ReviewsRepository, ReviewWithAuthor } from "../repositories/reviews-repository.js";
import { Paginated } from "../repositories/pagination.js";

const getMovieReviewsSchema = z.object({
  tmdbId: z.string().min(1),
  mediaType: z.enum(["movie", "tv"]),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(10),
});

type GetMovieReviewsRequest = z.infer<typeof getMovieReviewsSchema>;

interface GetMovieReviewsResponse {
  reviews: Paginated<ReviewWithAuthor>;
}

export class GetMovieReviewsUseCase {
  constructor(private reviewsRepository: ReviewsRepository) {}

  async execute(request: GetMovieReviewsRequest): Promise<GetMovieReviewsResponse> {
    const { tmdbId, mediaType, page, perPage } = getMovieReviewsSchema.parse(request);

    const reviews = await this.reviewsRepository.findManyByMoviePaginated(tmdbId, mediaType, { page, perPage });

    return { reviews };
  }
}
