import { prisma } from "../../../../shared/infra/database/prisma.js";
import { User } from "../../../../domain/entities/user.js";
import { UsersRepository } from "../../../../domain/repositories/users-repository.js";

export class PrismaUsersRepository implements UsersRepository {
  async create(user: User): Promise<User> {
    await prisma.user.create({
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        passwordHash: user.passwordHash,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    });

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return new User({
      id: user.id,
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return new User({
      id: user.id,
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    return new User({
      id: user.id,
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    });
  }
}
