import { FastifyInstance } from "fastify";
import { RegisterUserController } from "./controllers/register-user-controller.js";
import { AuthenticateUserController } from "./controllers/authenticate-user-controller.js";
import { RegisterReviewController } from "./controllers/register-review-controller.js";
import { VoteOnReviewController } from "./controllers/vote-on-review-controller.js";
import { authenticate } from "./middlewares/authenticate.js";

const registerUserController = new RegisterUserController();
const authenticateUserController = new AuthenticateUserController();
const registerReviewController = new RegisterReviewController();
const voteOnReviewController = new VoteOnReviewController();

export async function appRoutes(app: FastifyInstance) {
  app.post("/users", registerUserController.handle);
  app.post("/sessions", authenticateUserController.handle);

  // Authenticated routes
  app.post("/reviews", { preHandler: [authenticate] }, registerReviewController.handle);
  app.post("/reviews/:reviewId/votes", { preHandler: [authenticate] }, voteOnReviewController.handle);
}
