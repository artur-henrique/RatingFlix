import { Vote } from "../../domain/entities/vote.js";
import { VotesRepository } from "../../domain/repositories/votes-repository.js";
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
}
