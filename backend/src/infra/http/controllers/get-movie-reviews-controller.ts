import { FastifyReply, FastifyRequest } from "fastify";
import { PrismaReviewsRepository } from "../../database/prisma/repositories/prisma-reviews-repository.js";
import { PrismaVotesRepository } from "../../database/prisma/repositories/prisma-votes-repository.js";
import { GetMovieReviewsUseCase } from "../../../domain/use-cases/get-movie-reviews.js";

export class GetMovieReviewsController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { tmdbId } = request.params as any;
    const { mediaType, page, perPage } = request.query as any;
    const requesterId = (request as any).user?.id;

    const reviewsRepository = new PrismaReviewsRepository();
    const votesRepository = new PrismaVotesRepository();
    const getMovieReviewsUseCase = new GetMovieReviewsUseCase(reviewsRepository, votesRepository);

    const { reviews } = await getMovieReviewsUseCase.execute({
      tmdbId,
      mediaType,
      page,
      perPage,
      requesterId,
    });

    return reply.status(200).send({ reviews });
  }
}
