import { prisma } from "../../../../shared/infra/database/prisma.js";
import { Vote } from "../../../../domain/entities/vote.js";
import { VotesRepository } from "../../../../domain/repositories/votes-repository.js";

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
}
