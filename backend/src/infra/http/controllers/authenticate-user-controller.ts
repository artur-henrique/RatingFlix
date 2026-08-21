import { FastifyRequest, FastifyReply } from "fastify";
import { PrismaUsersRepository } from "../../database/prisma/repositories/prisma-users-repository.js";
import { AuthenticateUserUseCase } from "../../../domain/use-cases/authenticate-user.js";
import { InvalidCredentialsError } from "../../../domain/errors/invalid-credentials-error.js";

export class AuthenticateUserController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as any;

    const usersRepository = new PrismaUsersRepository();
    const authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);

    try {
      const { user, token } = await authenticateUserUseCase.execute({
        email,
        password,
      });

      return reply.status(200).send({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
        },
        token,
      });
    } catch (err: any) {
      if (err instanceof InvalidCredentialsError) {
        return reply.status(400).send({ message: err.message });
      }

      throw err;
    }
  }
}
