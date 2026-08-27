import { FollowsRepository } from "../../domain/repositories/follows-repository.js";

interface FollowItem {
  followerId: string;
  followingId: string;
}

export class InMemoryFollowsRepository implements FollowsRepository {
  public items: FollowItem[] = [];

  async follow(followerId: string, followingId: string): Promise<void> {
    this.items.push({ followerId, followingId });
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    const index = this.items.findIndex(
      (item) => item.followerId === followerId && item.followingId === followingId
    );
    if (index >= 0) {
      this.items.splice(index, 1);
    }
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return this.items.some((item) => item.followerId === followerId && item.followingId === followingId);
  }

  async findFollowingIds(followerId: string): Promise<string[]> {
    return this.items.filter((item) => item.followerId === followerId).map((item) => item.followingId);
  }
}
