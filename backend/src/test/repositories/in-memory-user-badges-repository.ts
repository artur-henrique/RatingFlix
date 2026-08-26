import { Badge } from "../../domain/entities/badge.js";
import { UserBadgesRepository } from "../../domain/repositories/user-badges-repository.js";
import { InMemoryBadgesRepository } from "./in-memory-badges-repository.js";

interface UserBadgeItem {
  userId: string;
  badgeId: string;
}

export class InMemoryUserBadgesRepository implements UserBadgesRepository {
  public items: UserBadgeItem[] = [];

  constructor(private badgesRepository: InMemoryBadgesRepository) {}

  async create(userId: string, badgeId: string): Promise<void> {
    this.items.push({ userId, badgeId });
  }

  async delete(userId: string, badgeId: string): Promise<void> {
    const index = this.items.findIndex((item) => item.userId === userId && item.badgeId === badgeId);
    if (index >= 0) {
      this.items.splice(index, 1);
    }
  }

  async findManyByUserId(userId: string): Promise<Badge[]> {
    const badgeIds = this.items.filter((item) => item.userId === userId).map((item) => item.badgeId);
    return this.badgesRepository.items.filter((badge) => badgeIds.includes(badge.id));
  }
}
