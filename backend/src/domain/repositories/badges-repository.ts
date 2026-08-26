import { Badge } from "../entities/badge.js";

export interface BadgesRepository {
  create(badge: Badge): Promise<Badge>;
  findById(id: string): Promise<Badge | null>;
  findByName(name: string): Promise<Badge | null>;
  findMany(): Promise<Badge[]>;
}
