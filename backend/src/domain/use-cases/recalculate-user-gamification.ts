import { z } from "zod";
import { ReviewsRepository } from "../repositories/reviews-repository.js";
import { VotesRepository } from "../repositories/votes-repository.js";
import { BadgesRepository } from "../repositories/badges-repository.js";
import { UserBadgesRepository } from "../repositories/user-badges-repository.js";

const recalculateUserGamificationSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
});

type RecalculateUserGamificationRequest = z.infer<typeof recalculateUserGamificationSchema>;

interface RecalculateUserGamificationResponse {
  score: number;
  qualifiedBadges: string[];
}

interface BadgeRequirement {
  name: string;
  minScore: number;
  minReviews: number;
  minRecentReviews: number; // in last 30 days
  minUpvotes: number;
}

export function calculateReputationScore(totalReviews: number, totalUpvotes: number): number {
  // Formula: 2 points per review + 5 points per upvote
  return totalReviews * 2 + totalUpvotes * 5;
}

export const BADGE_RULES: BadgeRequirement[] = [
  { name: "Rookie", minScore: 0, minReviews: 1, minRecentReviews: 0, minUpvotes: 0 },
  { name: "Prestige", minScore: 5, minReviews: 3, minRecentReviews: 0, minUpvotes: 0 },
  { name: "Forrest", minScore: 15, minReviews: 5, minRecentReviews: 0, minUpvotes: 0 },
  { name: "Matrix", minScore: 30, minReviews: 8, minRecentReviews: 0, minUpvotes: 0 },
  { name: "Morpheus", minScore: 50, minReviews: 12, minRecentReviews: 1, minUpvotes: 0 },
  { name: "Neo", minScore: 80, minReviews: 20, minRecentReviews: 1, minUpvotes: 10 },
  { name: "Gladiator", minScore: 120, minReviews: 30, minRecentReviews: 2, minUpvotes: 20 },
  { name: "Terminator", minScore: 180, minReviews: 45, minRecentReviews: 2, minUpvotes: 40 },
  { name: "Rocky", minScore: 250, minReviews: 60, minRecentReviews: 3, minUpvotes: 70 },
  { name: "Godfather", minScore: 350, minReviews: 80, minRecentReviews: 3, minUpvotes: 120 },
  { name: "Vader", minScore: 500, minReviews: 100, minRecentReviews: 4, minUpvotes: 200 },
  { name: "Spielberg", minScore: 700, minReviews: 150, minRecentReviews: 4, minUpvotes: 350 },
];

export class RecalculateUserGamificationUseCase {
  constructor(
    private reviewsRepository: ReviewsRepository,
    private votesRepository: VotesRepository,
    private badgesRepository: BadgesRepository,
    private userBadgesRepository: UserBadgesRepository
  ) {}

  async execute(request: RecalculateUserGamificationRequest): Promise<RecalculateUserGamificationResponse> {
    const { userId } = recalculateUserGamificationSchema.parse(request);

    // 1. Fetch user reviews and calculate totals
    const userReviews = await this.reviewsRepository.findManyByUserId(userId);
    const totalReviews = userReviews.length;

    // Filter reviews in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentReviews = userReviews.filter((review) => review.createdAt >= thirtyDaysAgo).length;

    // 2. Count total upvotes received on all user reviews
    const totalUpvotes = await this.votesRepository.countVotesByReviewOwner(userId);

    // 3. Calculate Reputation Score
    const score = calculateReputationScore(totalReviews, totalUpvotes);

    // 4. Determine qualified badges
    const qualifiedBadgeNames = BADGE_RULES.filter((rule) => {
      return (
        score >= rule.minScore &&
        totalReviews >= rule.minReviews &&
        recentReviews >= rule.minRecentReviews &&
        totalUpvotes >= rule.minUpvotes
      );
    }).map((rule) => rule.name);

    // 5. Fetch all system badges
    const allSystemBadges = await this.badgesRepository.findMany();
    const currentBadges = await this.userBadgesRepository.findManyByUserId(userId);
    const currentBadgeNames = currentBadges.map((badge) => badge.name);

    // 6. Synchronize user badges: ADD newly qualified badges, REMOVE those no longer qualified (downgrades)
    for (const rule of BADGE_RULES) {
      const isQualified = qualifiedBadgeNames.includes(rule.name);
      const alreadyHas = currentBadgeNames.includes(rule.name);
      
      const badge = allSystemBadges.find((b) => b.name === rule.name);
      if (!badge) continue; // If system badge does not exist in DB, skip

      if (isQualified && !alreadyHas) {
        // Upgrade / Award Badge
        await this.userBadgesRepository.create(userId, badge.id);
      } else if (!isQualified && alreadyHas) {
        // Downgrade / Remove Badge (due to inactivity or negative review reactions)
        await this.userBadgesRepository.delete(userId, badge.id);
      }
    }

    return {
      score,
      qualifiedBadges: qualifiedBadgeNames,
    };
  }
}
