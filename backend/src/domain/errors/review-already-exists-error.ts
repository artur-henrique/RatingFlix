export class ReviewAlreadyExistsError extends Error {
  constructor() {
    super("You have already reviewed this movie or TV show.");
    this.name = "ReviewAlreadyExistsError";
  }
}
