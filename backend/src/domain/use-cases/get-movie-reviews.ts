import { z } from "zod";
import { ReviewsRepository, ReviewWithAuthorAndVotes } from "../repositories/reviews-repository.js";
import { VotesRepository } from "../repositories/votes-repository.js";
import { Paginated } from "../repositories/pagination.js";

const getMovieReviewsSchema = z.object({
  tmdbId: z.string().min(1),
  mediaType: z.enum(["movie", "tv"]),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(10),
  requesterId: z.string().uuid().optional(),
});

type GetMovieReviewsRequest = z.infer<typeof getMovieReviewsSchema>;

interface GetMovieReviewsResponse {
  reviews: Paginated<ReviewWithAuthorAndVotes>;
}

export class GetMovieReviewsUseCase {
  constructor(
    private reviewsRepository: ReviewsRepository,
    private votesRepository: VotesRepository
  ) {}

  async execute(request: GetMovieReviewsRequest): Promise<GetMovieReviewsResponse> {
    const { tmdbId, mediaType, page, perPage, requesterId } = getMovieReviewsSchema.parse(request);

    const reviews = await this.reviewsRepository.findManyByMoviePaginated(tmdbId, mediaType, { page, perPage });

    const voteSummaries = await this.votesRepository.countAndUserVoteByReviewIds(
      reviews.items.map((review) => review.id),
      requesterId
    );

    return {
      reviews: {
        ...reviews,
        items: reviews.items.map((review) => ({
          ...review,
          votes: voteSummaries.get(review.id) ?? { upvotes: 0, downvotes: 0, myVote: null },
        })),
      },
    };
  }
}
