import { User } from "../../domain/entities/user.js";
import { UsersRepository } from "../../domain/repositories/users-repository.js";

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = [];

  async create(user: User): Promise<User> {
    this.items.push(user);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.items.find((item) => item.email === email);
    return user ?? null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = this.items.find((item) => item.username === username);
    return user ?? null;
  }
}
