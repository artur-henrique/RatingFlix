export class UserNotFoundError extends Error {
  constructor(identifier: string) {
    super(`User "${identifier}" not found.`);
    this.name = "UserNotFoundError";
  }
}
