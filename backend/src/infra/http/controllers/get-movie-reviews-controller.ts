import { FastifyReply, FastifyRequest } from "fastify";
import { PrismaReviewsRepository } from "../../database/prisma/repositories/prisma-reviews-repository.js";
import { GetMovieReviewsUseCase } from "../../../domain/use-cases/get-movie-reviews.js";

export class GetMovieReviewsController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { tmdbId } = request.params as any;
    const { mediaType, page, perPage } = request.query as any;

    const reviewsRepository = new PrismaReviewsRepository();
    const getMovieReviewsUseCase = new GetMovieReviewsUseCase(reviewsRepository);

    const { reviews } = await getMovieReviewsUseCase.execute({ tmdbId, mediaType, page, perPage });

    return reply.status(200).send({ reviews });
  }
}
