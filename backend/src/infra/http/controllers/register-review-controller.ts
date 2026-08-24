import { FastifyReply, FastifyRequest } from "fastify";
import { PrismaReviewsRepository } from "../../database/prisma/repositories/prisma-reviews-repository.js";
import { CreateReviewUseCase } from "../../../domain/use-cases/create-review.js";
import { ReviewAlreadyExistsError } from "../../../domain/errors/review-already-exists-error.js";

export class RegisterReviewController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id: userId } = (request as any).user;
    const { tmdbId, mediaType, rating, content } = request.body as any;

    const reviewsRepository = new PrismaReviewsRepository();
    const createReviewUseCase = new CreateReviewUseCase(reviewsRepository);

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
