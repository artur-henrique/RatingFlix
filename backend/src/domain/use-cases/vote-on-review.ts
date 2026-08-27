import { z } from "zod";
import { Vote } from "../entities/vote.js";
import { VotesRepository } from "../repositories/votes-repository.js";
import { ReviewsRepository } from "../repositories/reviews-repository.js";
import { RecalculateUserGamificationUseCase } from "./recalculate-user-gamification.js";
import { SelfVotingError } from "../errors/self-voting-error.js";

const voteOnReviewSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  reviewId: z.string().uuid("Invalid review ID format"),
  type: z.enum(["upvote", "downvote"]),
});

type VoteOnReviewRequest = z.infer<typeof voteOnReviewSchema>;

interface VoteOnReviewResponse {
  voted: boolean; // true if a vote is active, false if toggled off
  type: "upvote" | "downvote" | null;
}

export class VoteOnReviewUseCase {
  constructor(
    private votesRepository: VotesRepository,
    private reviewsRepository: ReviewsRepository,
    private recalculateUserGamificationUseCase: RecalculateUserGamificationUseCase
  ) {}

  async execute(request: VoteOnReviewRequest): Promise<VoteOnReviewResponse> {
    const data = voteOnReviewSchema.parse(request);

    // 1. Verify review exists
    const review = await this.reviewsRepository.findById(data.reviewId);
    if (!review) {
      throw new Error("Review not found.");
    }

    // 2. Enforce business rule: Cannot vote on your own reviews!
    if (review.userId === data.userId) {
      throw new SelfVotingError();
    }

    // 3. Check for existing vote by this user on this review
    const existingVote = await this.votesRepository.findByUserAndReview(data.userId, data.reviewId);

    let voted = true;
    let finalType: "upvote" | "downvote" | null = data.type;

    if (existingVote) {
      if (existingVote.type === data.type) {
        // Toggled off (e.g. upvoting again removes the upvote)
        await this.votesRepository.delete(existingVote.id);
        voted = false;
        finalType = null;
      } else {
        // Switched vote type (e.g. upvote -> downvote)
        await this.votesRepository.delete(existingVote.id);
        
        const newVote = new Vote({
          userId: data.userId,
          reviewId: data.reviewId,
          type: data.type,
        });
        await this.votesRepository.create(newVote);
      }
    } else {
      // First time voting
      const newVote = new Vote({
        userId: data.userId,
        reviewId: data.reviewId,
        type: data.type,
      });
      await this.votesRepository.create(newVote);
    }

    // 4. TRIGGER AUTOMATIC RECALCULATION: Trigger gamification recalculation of the REVIEW OWNER
    await this.recalculateUserGamificationUseCase.execute({
      userId: review.userId,
    });

    return {
      voted,
      type: finalType,
    };
  }
}
