import { describe, it, expect, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthenticateUserUseCase } from "./authenticate-user.js";
import { InMemoryUsersRepository } from "../../test/repositories/in-memory-users-repository.js";
import { User } from "../entities/user.js";
import { InvalidCredentialsError } from "../errors/invalid-credentials-error.js";

let usersRepository: InMemoryUsersRepository;
let sut: AuthenticateUserUseCase; // System Under Test

describe("Authenticate User Use Case", () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    sut = new AuthenticateUserUseCase(usersRepository);

    // Pre-create a user to authenticate against in tests
    const passwordHash = await bcrypt.hash("correct-password", 6);
    const user = new User({
      username: "john_doe",
      email: "john@example.com",
      passwordHash,
    });

    await usersRepository.create(user);
  });

  it("should be able to authenticate with correct credentials", async () => {
    const { user, token } = await sut.execute({
      email: "john@example.com",
      password: "correct-password",
    });

    expect(user.id).toStrictEqual(expect.any(String));
    expect(user.email).toBe("john@example.com");
    expect(token).toStrictEqual(expect.any(String));

    // Decode token and verify details
    const decoded = jwt.verify(token, "super-secret-default-key") as { sub: string; username: string };
    expect(decoded.sub).toBe(user.id);
    expect(decoded.username).toBe("john_doe");
  });

  it("should not be able to authenticate with a non-existent email", async () => {
    await expect(() =>
      sut.execute({
        email: "non-existent@example.com",
        password: "correct-password",
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("should not be able to authenticate with an incorrect password", async () => {
    await expect(() =>
      sut.execute({
        email: "john@example.com",
        password: "wrong-password",
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
