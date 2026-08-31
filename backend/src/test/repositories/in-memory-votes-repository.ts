import { Vote } from "../../domain/entities/vote.js";
import { ReviewVoteSummary, VotesRepository } from "../../domain/repositories/votes-repository.js";
import { InMemoryReviewsRepository } from "./in-memory-reviews-repository.js";

export class InMemoryVotesRepository implements VotesRepository {
  public items: Vote[] = [];

  constructor(private reviewsRepository?: InMemoryReviewsRepository) {}

  async create(vote: Vote): Promise<Vote> {
    this.items.push(vote);
    return vote;
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index >= 0) {
      this.items.splice(index, 1);
    }
  }

  async findByUserAndReview(userId: string, reviewId: string): Promise<Vote | null> {
    const vote = this.items.find((item) => item.userId === userId && item.reviewId === reviewId);
    return vote ?? null;
  }

  async countVotesByReviewOwner(userId: string): Promise<number> {
    if (!this.reviewsRepository) {
      return 0;
    }

    // Find all reviews written by this user
    const userReviewIds = this.reviewsRepository.items
      .filter((review) => review.userId === userId)
      .map((review) => review.id);

    // Count upvotes on these reviews
    return this.items.filter((vote) => userReviewIds.includes(vote.reviewId) && vote.type === "upvote").length;
  }

  async countAndUserVoteByReviewIds(
    reviewIds: string[],
    userId?: string
  ): Promise<Map<string, ReviewVoteSummary>> {
    const result = new Map<string, ReviewVoteSummary>();
    for (const reviewId of reviewIds) {
      result.set(reviewId, { upvotes: 0, downvotes: 0, myVote: null });
    }

    for (const vote of this.items) {
      const summary = result.get(vote.reviewId);
      if (!summary) continue;

      if (vote.type === "upvote") {
        summary.upvotes += 1;
      } else if (vote.type === "downvote") {
        summary.downvotes += 1;
      }

      if (userId && vote.userId === userId) {
        summary.myVote = vote.type;
      }
    }

    return result;
  }
}
