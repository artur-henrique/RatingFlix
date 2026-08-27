import { z } from "zod";
import { FollowsRepository } from "../repositories/follows-repository.js";
import { UsersRepository } from "../repositories/users-repository.js";
import { SelfFollowingError } from "../errors/self-following-error.js";
import { UserNotFoundError } from "../errors/user-not-found-error.js";

const followUserSchema = z.object({
  followerId: z.string().uuid("Invalid follower ID format"),
  followingId: z.string().uuid("Invalid user ID format"),
});

type FollowUserRequest = z.infer<typeof followUserSchema>;

interface FollowUserResponse {
  following: boolean; // true if now following, false if the follow was toggled off
}

export class FollowUserUseCase {
  constructor(
    private followsRepository: FollowsRepository,
    private usersRepository: UsersRepository
  ) {}

  async execute(request: FollowUserRequest): Promise<FollowUserResponse> {
    const { followerId, followingId } = followUserSchema.parse(request);

    if (followerId === followingId) {
      throw new SelfFollowingError();
    }

    const userToFollow = await this.usersRepository.findById(followingId);
    if (!userToFollow) {
      throw new UserNotFoundError(followingId);
    }

    const alreadyFollowing = await this.followsRepository.isFollowing(followerId, followingId);

    if (alreadyFollowing) {
      await this.followsRepository.unfollow(followerId, followingId);
      return { following: false };
    }

    await this.followsRepository.follow(followerId, followingId);
    return { following: true };
  }
}
