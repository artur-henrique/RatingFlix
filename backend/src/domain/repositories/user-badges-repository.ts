import { Badge } from "../entities/badge.js";

export interface UserBadgesRepository {
  create(userId: string, badgeId: string): Promise<void>;
  delete(userId: string, badgeId: string): Promise<void>;
  findManyByUserId(userId: string): Promise<Badge[]>;
}
