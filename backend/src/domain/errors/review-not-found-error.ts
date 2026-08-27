export class ReviewNotFoundError extends Error {
  constructor() {
    super("Review not found.");
    this.name = "ReviewNotFoundError";
  }
}
