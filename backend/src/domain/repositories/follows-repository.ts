export interface FollowsRepository {
  follow(followerId: string, followingId: string): Promise<void>;
  unfollow(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  findFollowingIds(followerId: string): Promise<string[]>;
}
