import { FastifyReply, FastifyRequest } from "fastify";
import { PrismaReviewsRepository } from "../../database/prisma/repositories/prisma-reviews-repository.js";
import { PrismaVotesRepository } from "../../database/prisma/repositories/prisma-votes-repository.js";
import { PrismaBadgesRepository } from "../../database/prisma/repositories/prisma-badges-repository.js";
import { PrismaUserBadgesRepository } from "../../database/prisma/repositories/prisma-user-badges-repository.js";
import { CreateReviewUseCase } from "../../../domain/use-cases/create-review.js";
import { RecalculateUserGamificationUseCase } from "../../../domain/use-cases/recalculate-user-gamification.js";
import { ReviewAlreadyExistsError } from "../../../domain/errors/review-already-exists-error.js";
import { TmdbMovieService } from "../../services/tmdb-movie-service.js";

export class RegisterReviewController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id: userId } = (request as any).user;
    const { tmdbId, mediaType, rating, content } = request.body as any;

    const reviewsRepository = new PrismaReviewsRepository();
    const votesRepository = new PrismaVotesRepository();
    const badgesRepository = new PrismaBadgesRepository();
    const userBadgesRepository = new PrismaUserBadgesRepository();
    const movieService = new TmdbMovieService();

    const recalculateUserGamificationUseCase = new RecalculateUserGamificationUseCase(
      reviewsRepository,
      votesRepository,
      badgesRepository,
      userBadgesRepository
    );
    const createReviewUseCase = new CreateReviewUseCase(
      reviewsRepository,
      recalculateUserGamificationUseCase,
      movieService
    );

    try {
      const { review } = await createReviewUseCase.execute({
        userId,
        tmdbId,
        mediaType,
        rating,
        content,
      });

      return reply.status(201).send({
        review: {
          id: review.id,
          userId: review.userId,
          tmdbId: review.tmdbId,
          mediaType: review.mediaType,
          rating: review.rating,
          content: review.content,
          movieTitle: review.movieTitle,
          moviePosterPath: review.moviePosterPath,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        },
      });
    } catch (err: any) {
      if (err instanceof ReviewAlreadyExistsError) {
        return reply.status(409).send({ message: err.message });
      }

      throw err;
    }
  }
}
