import { z } from "zod";
import { FollowsRepository } from "../repositories/follows-repository.js";
import { ReviewsRepository, ReviewWithAuthorAndVotes } from "../repositories/reviews-repository.js";
import { VotesRepository } from "../repositories/votes-repository.js";
import { Paginated } from "../repositories/pagination.js";

const getUserFeedSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(10),
});

type GetUserFeedRequest = z.infer<typeof getUserFeedSchema>;

interface GetUserFeedResponse {
  reviews: Paginated<ReviewWithAuthorAndVotes>;
}

export class GetUserFeedUseCase {
  constructor(
    private followsRepository: FollowsRepository,
    private reviewsRepository: ReviewsRepository,
    private votesRepository: VotesRepository
  ) {}

  async execute(request: GetUserFeedRequest): Promise<GetUserFeedResponse> {
    const { userId, page, perPage } = getUserFeedSchema.parse(request);

    const followingIds = await this.followsRepository.findFollowingIds(userId);

    if (followingIds.length === 0) {
      return { reviews: { items: [], total: 0, page, perPage } };
    }

    const reviews = await this.reviewsRepository.findManyByAuthorsPaginated(followingIds, { page, perPage });

    const voteSummaries = await this.votesRepository.countAndUserVoteByReviewIds(
      reviews.items.map((review) => review.id),
      userId
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
