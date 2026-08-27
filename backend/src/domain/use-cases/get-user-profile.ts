import { z } from "zod";
import { UsersRepository } from "../repositories/users-repository.js";
import { ReviewsRepository } from "../repositories/reviews-repository.js";
import { VotesRepository } from "../repositories/votes-repository.js";
import { UserBadgesRepository } from "../repositories/user-badges-repository.js";
import { Paginated } from "../repositories/pagination.js";
import { Review } from "../entities/review.js";
import { Badge } from "../entities/badge.js";
import { calculateReputationScore } from "./recalculate-user-gamification.js";
import { UserNotFoundError } from "../errors/user-not-found-error.js";

const getUserProfileSchema = z.object({
  username: z.string().min(1),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(10),
});

type GetUserProfileRequest = z.infer<typeof getUserProfileSchema>;

interface GetUserProfileResponse {
  profile: {
    id: string;
    username: string;
    avatarUrl: string | null;
    createdAt: Date;
    score: number;
    badges: Badge[];
  };
  reviews: Paginated<Review>;
}

export class GetUserProfileUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private reviewsRepository: ReviewsRepository,
    private votesRepository: VotesRepository,
    private userBadgesRepository: UserBadgesRepository
  ) {}

  async execute(request: GetUserProfileRequest): Promise<GetUserProfileResponse> {
    const { username, page, perPage } = getUserProfileSchema.parse(request);

    const user = await this.usersRepository.findByUsername(username);
    if (!user) {
      throw new UserNotFoundError(username);
    }

    const reviews = await this.reviewsRepository.findManyByUserIdPaginated(user.id, { page, perPage });
    const totalUpvotes = await this.votesRepository.countVotesByReviewOwner(user.id);
    const badges = await this.userBadgesRepository.findManyByUserId(user.id);

    const score = calculateReputationScore(reviews.total, totalUpvotes);

    return {
      profile: {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        score,
        badges,
      },
      reviews,
    };
  }
}
