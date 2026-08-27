import { FastifyReply, FastifyRequest } from "fastify";
import { PrismaVotesRepository } from "../../database/prisma/repositories/prisma-votes-repository.js";
import { PrismaReviewsRepository } from "../../database/prisma/repositories/prisma-reviews-repository.js";
import { PrismaBadgesRepository } from "../../database/prisma/repositories/prisma-badges-repository.js";
import { PrismaUserBadgesRepository } from "../../database/prisma/repositories/prisma-user-badges-repository.js";
import { RecalculateUserGamificationUseCase } from "../../../domain/use-cases/recalculate-user-gamification.js";
import { VoteOnReviewUseCase } from "../../../domain/use-cases/vote-on-review.js";
import { SelfVotingError } from "../../../domain/errors/self-voting-error.js";

export class VoteOnReviewController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id: userId } = (request as any).user;
    const { reviewId } = request.params as any;
    const { type } = request.body as any;

    // Instantiate repositories
    const votesRepository = new PrismaVotesRepository();
    const reviewsRepository = new PrismaReviewsRepository();
    const badgesRepository = new PrismaBadgesRepository();
    const userBadgesRepository = new PrismaUserBadgesRepository();

    // Instantiate use-cases for dependency injection
    const recalculateUserGamificationUseCase = new RecalculateUserGamificationUseCase(
      reviewsRepository,
      votesRepository,
      badgesRepository,
      userBadgesRepository
    );

    const voteOnReviewUseCase = new VoteOnReviewUseCase(
      votesRepository,
      reviewsRepository,
      recalculateUserGamificationUseCase
    );

    try {
      const { voted, type: finalType } = await voteOnReviewUseCase.execute({
        userId,
        reviewId,
        type,
      });

      return reply.status(200).send({
        voted,
        type: finalType,
      });
    } catch (err: any) {
      if (err instanceof SelfVotingError) {
        return reply.status(400).send({ message: err.message });
      }

      if (err.message === "Review not found.") {
        return reply.status(404).send({ message: err.message });
      }

      throw err;
    }
  }
}
