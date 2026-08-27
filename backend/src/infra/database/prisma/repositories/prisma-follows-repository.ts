import { prisma } from "../../../../shared/infra/database/prisma.js";
import { FollowsRepository } from "../../../../domain/repositories/follows-repository.js";

export class PrismaFollowsRepository implements FollowsRepository {
  async follow(followerId: string, followingId: string): Promise<void> {
    await prisma.follow.create({
      data: { followerId, followingId },
    });
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    return !!follow;
  }

  async findFollowingIds(followerId: string): Promise<string[]> {
    const follows = await prisma.follow.findMany({
      where: { followerId },
      select: { followingId: true },
    });

    return follows.map((follow: { followingId: string }) => follow.followingId);
  }
}
