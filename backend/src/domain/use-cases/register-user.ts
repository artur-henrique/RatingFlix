import { z } from "zod";
import bcrypt from "bcryptjs";
import { User } from "../entities/user.js";
import { UsersRepository } from "../repositories/users-repository.js";
import { UserAlreadyExistsError } from "../errors/user-already-exists-error.js";

const registerUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must have at least 3 characters")
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must have at least 6 characters"),
  avatarUrl: z.string().url("Invalid URL format").nullable().optional(),
});

type RegisterUserRequest = z.infer<typeof registerUserSchema>;

interface RegisterUserResponse {
  user: User;
}

export class RegisterUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    const data = registerUserSchema.parse(request);

    const userByEmail = await this.usersRepository.findByEmail(data.email);
    if (userByEmail) {
      throw new UserAlreadyExistsError(data.email);
    }

    const userByUsername = await this.usersRepository.findByUsername(data.username);
    if (userByUsername) {
      throw new UserAlreadyExistsError(data.username);
    }

    const passwordHash = await bcrypt.hash(data.password, 6);

    const user = new User({
      username: data.username,
      email: data.email,
      passwordHash,
      avatarUrl: data.avatarUrl,
    });

    await this.usersRepository.create(user);

    return { user };
  }
}
