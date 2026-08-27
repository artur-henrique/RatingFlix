import { FastifyReply, FastifyRequest } from "fastify";
import { PrismaFollowsRepository } from "../../database/prisma/repositories/prisma-follows-repository.js";
import { PrismaUsersRepository } from "../../database/prisma/repositories/prisma-users-repository.js";
import { FollowUserUseCase } from "../../../domain/use-cases/follow-user.js";
import { SelfFollowingError } from "../../../domain/errors/self-following-error.js";
import { UserNotFoundError } from "../../../domain/errors/user-not-found-error.js";

export class FollowUserController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id: followerId } = (request as any).user;
    const { userId: followingId } = request.params as any;

    const followsRepository = new PrismaFollowsRepository();
    const usersRepository = new PrismaUsersRepository();
    const followUserUseCase = new FollowUserUseCase(followsRepository, usersRepository);

    try {
      const { following } = await followUserUseCase.execute({ followerId, followingId });

      return reply.status(200).send({ following });
    } catch (err: any) {
      if (err instanceof SelfFollowingError) {
        return reply.status(400).send({ message: err.message });
      }

      if (err instanceof UserNotFoundError) {
        return reply.status(404).send({ message: err.message });
      }

      throw err;
    }
  }
}
