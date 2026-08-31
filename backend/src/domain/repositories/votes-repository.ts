import { Vote } from "../entities/vote.js";

export interface ReviewVoteSummary {
  upvotes: number;
  downvotes: number;
  myVote: "upvote" | "downvote" | null; // null = não votou, ou ninguém autenticado perguntando
}

export interface VotesRepository {
  create(vote: Vote): Promise<Vote>;
  delete(id: string): Promise<void>;
  findByUserAndReview(userId: string, reviewId: string): Promise<Vote | null>;
  countVotesByReviewOwner(userId: string): Promise<number>; // Count upvotes received by a user's reviews
  // Busca em lote (evita N+1): uma query para todas as reviews de uma página, não uma por review.
  countAndUserVoteByReviewIds(
    reviewIds: string[],
    userId?: string
  ): Promise<Map<string, ReviewVoteSummary>>;
}
