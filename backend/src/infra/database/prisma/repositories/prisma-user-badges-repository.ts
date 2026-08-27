import { prisma } from "../../../../shared/infra/database/prisma.js";
import { Badge } from "../../../../domain/entities/badge.js";
import { UserBadgesRepository } from "../../../../domain/repositories/user-badges-repository.js";

export class PrismaUserBadgesRepository implements UserBadgesRepository {
  async create(userId: string, badgeId: string): Promise<void> {
    await prisma.userBadge.create({
      data: {
        userId,
        badgeId,
      },
    });
  }

  async delete(userId: string, badgeId: string): Promise<void> {
    await prisma.userBadge.delete({
      where: {
        userId_badgeId: {
          userId,
          badgeId,
        },
      },
    });
  }

  async findManyByUserId(userId: string): Promise<Badge[]> {
    const userBadges = await prisma.userBadge.findMany({
      where: {
        userId,
      },
      include: {
        badge: true,
      },
    });

    return userBadges.map(
      (ub: any) =>
        new Badge({
          id: ub.badge.id,
          name: ub.badge.name,
          description: ub.badge.description,
          iconUrl: ub.badge.iconUrl,
        })
    );
  }
}
