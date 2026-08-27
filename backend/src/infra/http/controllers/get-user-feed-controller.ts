import { FastifyReply, FastifyRequest } from "fastify";
import { PrismaFollowsRepository } from "../../database/prisma/repositories/prisma-follows-repository.js";
import { PrismaReviewsRepository } from "../../database/prisma/repositories/prisma-reviews-repository.js";
import { GetUserFeedUseCase } from "../../../domain/use-cases/get-user-feed.js";

export class GetUserFeedController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id: userId } = (request as any).user;
    const { page, perPage } = request.query as any;

    const followsRepository = new PrismaFollowsRepository();
    const reviewsRepository = new PrismaReviewsRepository();
    const getUserFeedUseCase = new GetUserFeedUseCase(followsRepository, reviewsRepository);

    const { reviews } = await getUserFeedUseCase.execute({ userId, page, perPage });

    return reply.status(200).send({ reviews });
  }
}
