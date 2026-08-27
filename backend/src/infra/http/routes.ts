import { FastifyInstance } from "fastify";
import { RegisterUserController } from "./controllers/register-user-controller.js";
import { AuthenticateUserController } from "./controllers/authenticate-user-controller.js";
import { RegisterReviewController } from "./controllers/register-review-controller.js";
import { VoteOnReviewController } from "./controllers/vote-on-review-controller.js";
import { GetUserProfileController } from "./controllers/get-user-profile-controller.js";
import { GetMovieReviewsController } from "./controllers/get-movie-reviews-controller.js";
import { SearchMoviesController } from "./controllers/search-movies-controller.js";
import { GetMovieDetailsController } from "./controllers/get-movie-details-controller.js";
import { FollowUserController } from "./controllers/follow-user-controller.js";
import { GetUserFeedController } from "./controllers/get-user-feed-controller.js";
import { authenticate } from "./middlewares/authenticate.js";

const registerUserController = new RegisterUserController();
const authenticateUserController = new AuthenticateUserController();
const registerReviewController = new RegisterReviewController();
const voteOnReviewController = new VoteOnReviewController();
const getUserProfileController = new GetUserProfileController();
const getMovieReviewsController = new GetMovieReviewsController();
const searchMoviesController = new SearchMoviesController();
const getMovieDetailsController = new GetMovieDetailsController();
const followUserController = new FollowUserController();
const getUserFeedController = new GetUserFeedController();

export async function appRoutes(app: FastifyInstance) {
  app.post("/users", registerUserController.handle);
  app.post("/sessions", authenticateUserController.handle);

  // Public routes
  app.get("/profiles/:username", getUserProfileController.handle);
  app.get("/movies/:tmdbId/reviews", getMovieReviewsController.handle);
  
  // TMDB External API Catalog routes
  app.get("/movies/search", searchMoviesController.handle);
  app.get("/movies/:mediaType/:id", getMovieDetailsController.handle);

  // Authenticated routes
  app.post("/reviews", { preHandler: [authenticate] }, registerReviewController.handle);
  app.post("/reviews/:reviewId/votes", { preHandler: [authenticate] }, voteOnReviewController.handle);
  app.post("/profiles/:userId/follow", { preHandler: [authenticate] }, followUserController.handle);
  app.get("/feed", { preHandler: [authenticate] }, getUserFeedController.handle);
}
