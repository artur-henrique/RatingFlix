import { FastifyRequest, FastifyReply } from "fastify";
import { PrismaUsersRepository } from "../../database/prisma/repositories/prisma-users-repository.js";
import { RegisterUserUseCase } from "../../../domain/use-cases/register-user.js";
import { UserAlreadyExistsError } from "../../../domain/errors/user-already-exists-error.js";

export class RegisterUserController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { username, email, password, avatarUrl } = request.body as any;

    const usersRepository = new PrismaUsersRepository();
    const registerUserUseCase = new RegisterUserUseCase(usersRepository);

    try {
      const { user } = await registerUserUseCase.execute({
        username,
        email,
        password,
        avatarUrl,
      });

      return reply.status(201).send({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
        },
      });
    } catch (err: any) {
      if (err instanceof UserAlreadyExistsError) {
        return reply.status(409).send({ message: err.message });
      }

      throw err;
    }
  }
}
