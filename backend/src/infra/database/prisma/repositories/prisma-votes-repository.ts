import { prisma } from "../../../../shared/infra/database/prisma.js";
import { Vote } from "../../../../domain/entities/vote.js";
import { ReviewVoteSummary, VotesRepository } from "../../../../domain/repositories/votes-repository.js";

export class PrismaVotesRepository implements VotesRepository {
  async create(vote: Vote): Promise<Vote> {
    await prisma.vote.create({
      data: {
        id: vote.id,
        userId: vote.userId,
        reviewId: vote.reviewId,
        type: vote.type,
        createdAt: vote.createdAt,
      },
    });

    return vote;
  }

  async delete(id: string): Promise<void> {
    await prisma.vote.delete({
      where: { id },
    });
  }

  async findByUserAndReview(userId: string, reviewId: string): Promise<Vote | null> {
    const vote = await prisma.vote.findFirst({
      where: {
        userId,
        reviewId,
      },
    });

    if (!vote) {
      return null;
    }

    return new Vote({
      id: vote.id,
      userId: vote.userId,
      reviewId: vote.reviewId,
      type: vote.type as "upvote" | "downvote",
      createdAt: vote.createdAt,
    });
  }

  async countVotesByReviewOwner(userId: string): Promise<number> {
    const count = await prisma.vote.count({
      where: {
        review: {
          userId,
        },
        type: "upvote",
      },
    });

    return count;
  }

  async countAndUserVoteByReviewIds(
    reviewIds: string[],
    userId?: string
  ): Promise<Map<string, ReviewVoteSummary>> {
    const result = new Map<string, ReviewVoteSummary>();
    if (reviewIds.length === 0) {
      return result;
    }

    for (const reviewId of reviewIds) {
      result.set(reviewId, { upvotes: 0, downvotes: 0, myVote: null });
    }

    const votes = await prisma.vote.findMany({
      where: { reviewId: { in: reviewIds } },
      select: { reviewId: true, userId: true, type: true },
    });

    for (const vote of votes) {
      const summary = result.get(vote.reviewId);
      if (!summary) continue;

      if (vote.type === "upvote") {
        summary.upvotes += 1;
      } else if (vote.type === "downvote") {
        summary.downvotes += 1;
      }

      if (userId && vote.userId === userId) {
        summary.myVote = vote.type as "upvote" | "downvote";
      }
    }

    return result;
  }
}
