import { Vote } from "../entities/vote.js";

export interface VotesRepository {
  create(vote: Vote): Promise<Vote>;
  delete(id: string): Promise<void>;
  findByUserAndReview(userId: string, reviewId: string): Promise<Vote | null>;
  countVotesByReviewOwner(userId: string): Promise<number>; // Count upvotes received by a user's reviews
}
