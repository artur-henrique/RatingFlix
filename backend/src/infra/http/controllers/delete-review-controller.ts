import { FastifyReply, FastifyRequest } from "fastify";
import { PrismaReviewsRepository } from "../../database/prisma/repositories/prisma-reviews-repository.js";
import { PrismaVotesRepository } from "../../database/prisma/repositories/prisma-votes-repository.js";
import { PrismaBadgesRepository } from "../../database/prisma/repositories/prisma-badges-repository.js";
import { PrismaUserBadgesRepository } from "../../database/prisma/repositories/prisma-user-badges-repository.js";
import { DeleteReviewUseCase } from "../../../domain/use-cases/delete-review.js";
import { RecalculateUserGamificationUseCase } from "../../../domain/use-cases/recalculate-user-gamification.js";
import { ReviewNotFoundError } from "../../../domain/errors/review-not-found-error.js";
import { NotReviewOwnerError } from "../../../domain/errors/not-review-owner-error.js";

export class DeleteReviewController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id: userId } = (request as any).user;
    const { reviewId } = request.params as any;

    const reviewsRepository = new PrismaReviewsRepository();
    const votesRepository = new PrismaVotesRepository();
    const badgesRepository = new PrismaBadgesRepository();
    const userBadgesRepository = new PrismaUserBadgesRepository();

    const recalculateUserGamificationUseCase = new RecalculateUserGamificationUseCase(
      reviewsRepository,
      votesRepository,
      badgesRepository,
      userBadgesRepository
    );
    const deleteReviewUseCase = new DeleteReviewUseCase(reviewsRepository, recalculateUserGamificationUseCase);

    try {
      await deleteReviewUseCase.execute({ reviewId, userId });

      return reply.status(204).send();
    } catch (err: any) {
      if (err instanceof ReviewNotFoundError) {
        return reply.status(404).send({ message: err.message });
      }

      if (err instanceof NotReviewOwnerError) {
        return reply.status(403).send({ message: err.message });
      }

      throw err;
    }
  }
}
