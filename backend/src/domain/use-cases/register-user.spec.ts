import { describe, it, expect, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { RegisterUserUseCase } from "./register-user.js";
import { InMemoryUsersRepository } from "../../test/repositories/in-memory-users-repository.js";
import { UserAlreadyExistsError } from "../errors/user-already-exists-error.js";

let usersRepository: InMemoryUsersRepository;
let sut: RegisterUserUseCase; // System Under Test

describe("Register User Use Case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    sut = new RegisterUserUseCase(usersRepository);
  });

  it("should be able to register a new user", async () => {
    const { user } = await sut.execute({
      username: "cinephile_john",
      email: "john@example.com",
      password: "securepassword123",
    });

    expect(user.id).toStrictEqual(expect.any(String));
    expect(user.username).toBe("cinephile_john");
    expect(user.email).toBe("john@example.com");
    
    // Check if the password hash is actually generated and not plain text
    const isPasswordValid = await bcrypt.compare("securepassword123", user.passwordHash);
    expect(isPasswordValid).toBe(true);
  });

  it("should not be able to register a new user with an existing email", async () => {
    await sut.execute({
      username: "user_one",
      email: "duplicate@example.com",
      password: "password123",
    });

    await expect(() =>
      sut.execute({
        username: "user_two",
        email: "duplicate@example.com",
        password: "password123",
      })
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });

  it("should not be able to register a new user with an existing username", async () => {
    await sut.execute({
      username: "duplicate_user",
      email: "one@example.com",
      password: "password123",
    });

    await expect(() =>
      sut.execute({
        username: "duplicate_user",
        email: "two@example.com",
        password: "password123",
      })
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });

  it("should validate username constraints", async () => {
    await expect(() =>
      sut.execute({
        username: "jo", // too short
        email: "john@example.com",
        password: "password123",
      })
    ).rejects.toThrow();

    await expect(() =>
      sut.execute({
        username: "invalid-user!", // invalid chars
        email: "john@example.com",
        password: "password123",
      })
    ).rejects.toThrow();
  });
});
