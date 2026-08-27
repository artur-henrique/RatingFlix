import { prisma } from "../../../../shared/infra/database/prisma.js";
import { Badge } from "../../../../domain/entities/badge.js";
import { BadgesRepository } from "../../../../domain/repositories/badges-repository.js";

export class PrismaBadgesRepository implements BadgesRepository {
  async create(badge: Badge): Promise<Badge> {
    await prisma.badge.create({
      data: {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        iconUrl: badge.iconUrl,
      },
    });

    return badge;
  }

  async findById(id: string): Promise<Badge | null> {
    const badge = await prisma.badge.findUnique({
      where: { id },
    });

    if (!badge) {
      return null;
    }

    return new Badge({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      iconUrl: badge.iconUrl,
    });
  }

  async findByName(name: string): Promise<Badge | null> {
    const badge = await prisma.badge.findUnique({
      where: { name },
    });

    if (!badge) {
      return null;
    }

    return new Badge({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      iconUrl: badge.iconUrl,
    });
  }

  async findMany(): Promise<Badge[]> {
    const badges = await prisma.badge.findMany();

    return badges.map(
      (badge: any) =>
        new Badge({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          iconUrl: badge.iconUrl,
        })
    );
  }
}
