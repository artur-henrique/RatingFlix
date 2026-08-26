import { Badge } from "../../domain/entities/badge.js";
import { BadgesRepository } from "../../domain/repositories/badges-repository.js";

export class InMemoryBadgesRepository implements BadgesRepository {
  public items: Badge[] = [];

  async create(badge: Badge): Promise<Badge> {
    this.items.push(badge);
    return badge;
  }

  async findById(id: string): Promise<Badge | null> {
    const badge = this.items.find((item) => item.id === id);
    return badge ?? null;
  }

  async findByName(name: string): Promise<Badge | null> {
    const badge = this.items.find((item) => item.name.toLowerCase() === name.toLowerCase());
    return badge ?? null;
  }

  async findMany(): Promise<Badge[]> {
    return this.items;
  }
}
