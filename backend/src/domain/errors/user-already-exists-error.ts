export class UserAlreadyExistsError extends Error {
  constructor(identifier: string) {
    super(`User with email or username "${identifier}" already exists.`);
    this.name = "UserAlreadyExistsError";
  }
}
