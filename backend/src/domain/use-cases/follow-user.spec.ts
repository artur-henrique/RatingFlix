import { describe, it, expect, beforeEach } from "vitest";
import { randomUUID } from "node:crypto";
import { FollowUserUseCase } from "./follow-user.js";
import { InMemoryFollowsRepository } from "../../test/repositories/in-memory-follows-repository.js";
import { InMemoryUsersRepository } from "../../test/repositories/in-memory-users-repository.js";
import { User } from "../entities/user.js";
import { SelfFollowingError } from "../errors/self-following-error.js";
import { UserNotFoundError } from "../errors/user-not-found-error.js";

let followsRepository: InMemoryFollowsRepository;
let usersRepository: InMemoryUsersRepository;
let sut: FollowUserUseCase;

describe("Follow User Use Case", () => {
  beforeEach(() => {
    followsRepository = new InMemoryFollowsRepository();
    usersRepository = new InMemoryUsersRepository();
    sut = new FollowUserUseCase(followsRepository, usersRepository);
  });

  it("should follow another user", async () => {
    const follower = await usersRepository.create(
      new User({ username: "follower", email: "follower@example.com", passwordHash: "hash" })
    );
    const critic = await usersRepository.create(
      new User({ username: "critic", email: "critic@example.com", passwordHash: "hash" })
    );

    const result = await sut.execute({ followerId: follower.id, followingId: critic.id });

    expect(result).toStrictEqual({ following: true });
    expect(await followsRepository.isFollowing(follower.id, critic.id)).toBe(true);
  });

  it("should unfollow when already following (toggle)", async () => {
    const follower = await usersRepository.create(
      new User({ username: "follower", email: "follower@example.com", passwordHash: "hash" })
    );
    const critic = await usersRepository.create(
      new User({ username: "critic", email: "critic@example.com", passwordHash: "hash" })
    );

    await sut.execute({ followerId: follower.id, followingId: critic.id });
    const result = await sut.execute({ followerId: follower.id, followingId: critic.id });

    expect(result).toStrictEqual({ following: false });
    expect(await followsRepository.isFollowing(follower.id, critic.id)).toBe(false);
  });

  it("should not allow a user to follow themselves", async () => {
    const user = await usersRepository.create(
      new User({ username: "artur", email: "artur@example.com", passwordHash: "hash" })
    );

    await expect(sut.execute({ followerId: user.id, followingId: user.id })).rejects.toBeInstanceOf(
      SelfFollowingError
    );
  });

  it("should throw when the user to follow does not exist", async () => {
    const follower = await usersRepository.create(
      new User({ username: "follower", email: "follower@example.com", passwordHash: "hash" })
    );

    await expect(
      sut.execute({ followerId: follower.id, followingId: randomUUID() })
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });
});
