import { FastifyReply, FastifyRequest } from "fastify";
import { PrismaUsersRepository } from "../../database/prisma/repositories/prisma-users-repository.js";
import { PrismaReviewsRepository } from "../../database/prisma/repositories/prisma-reviews-repository.js";
import { PrismaVotesRepository } from "../../database/prisma/repositories/prisma-votes-repository.js";
import { PrismaUserBadgesRepository } from "../../database/prisma/repositories/prisma-user-badges-repository.js";
import { GetUserProfileUseCase } from "../../../domain/use-cases/get-user-profile.js";
import { UserNotFoundError } from "../../../domain/errors/user-not-found-error.js";

export class GetUserProfileController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { username } = request.params as any;
    const { page, perPage } = request.query as any;

    const usersRepository = new PrismaUsersRepository();
    const reviewsRepository = new PrismaReviewsRepository();
    const votesRepository = new PrismaVotesRepository();
    const userBadgesRepository = new PrismaUserBadgesRepository();

    const getUserProfileUseCase = new GetUserProfileUseCase(
      usersRepository,
      reviewsRepository,
      votesRepository,
      userBadgesRepository
    );

    try {
      const { profile, reviews } = await getUserProfileUseCase.execute({ username, page, perPage });

      return reply.status(200).send({ profile, reviews });
    } catch (err: any) {
      if (err instanceof UserNotFoundError) {
        return reply.status(404).send({ message: err.message });
      }

      throw err;
    }
  }
}
