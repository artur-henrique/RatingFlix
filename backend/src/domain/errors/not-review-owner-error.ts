export class NotReviewOwnerError extends Error {
  constructor() {
    super("You can only edit or delete your own reviews.");
    this.name = "NotReviewOwnerError";
  }
}
