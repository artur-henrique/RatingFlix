export class SelfVotingError extends Error {
  constructor() {
    super("You cannot vote on your own reviews.");
    this.name = "SelfVotingError";
  }
}
