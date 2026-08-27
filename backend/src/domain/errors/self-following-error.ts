export class SelfFollowingError extends Error {
  constructor() {
    super("You cannot follow yourself.");
    this.name = "SelfFollowingError";
  }
}
