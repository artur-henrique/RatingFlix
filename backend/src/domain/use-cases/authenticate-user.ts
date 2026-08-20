import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../entities/user.js";
import { UsersRepository } from "../repositories/users-repository.js";
import { InvalidCredentialsError } from "../errors/invalid-credentials-error.js";

const authenticateUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

type AuthenticateUserRequest = z.infer<typeof authenticateUserSchema>;

interface AuthenticateUserResponse {
  user: User;
  token: string;
}

export class AuthenticateUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(request: AuthenticateUserRequest): Promise<AuthenticateUserResponse> {
    const data = authenticateUserSchema.parse(request);

    const user = await this.usersRepository.findByEmail(data.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordCorrect = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordCorrect) {
      throw new InvalidCredentialsError();
    }

    // Generate JWT Token
    // We can fetch the secret from process.env, with a fallback for testing
    const secret = process.env.JWT_SECRET ?? "super-secret-default-key";
    
    const token = jwt.sign(
      {
        sub: user.id,
        username: user.username,
      },
      secret,
      {
        expiresIn: "1d",
      }
    );

    return { user, token };
  }
}
