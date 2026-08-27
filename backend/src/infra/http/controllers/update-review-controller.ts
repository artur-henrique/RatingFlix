import { FastifyReply, FastifyRequest } from "fastify";
import { PrismaReviewsRepository } from "../../database/prisma/repositories/prisma-reviews-repository.js";
import { UpdateReviewUseCase } from "../../../domain/use-cases/update-review.js";
import { ReviewNotFoundError } from "../../../domain/errors/review-not-found-error.js";
import { NotReviewOwnerError } from "../../../domain/errors/not-review-owner-error.js";

export class UpdateReviewController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id: userId } = (request as any).user;
    const { reviewId } = request.params as any;
    const { rating, content } = request.body as any;

    const reviewsRepository = new PrismaReviewsRepository();
    const updateReviewUseCase = new UpdateReviewUseCase(reviewsRepository);

    try {
      const { review } = await updateReviewUseCase.execute({ reviewId, userId, rating, content });

      return reply.status(200).send({
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
      if (err instanceof ReviewNotFoundError) {
        return reply.status(404).send({ message: err.message });
      }

      if (err instanceof NotReviewOwnerError) {
        return reply.status(403).send({ message: err.message });
      }

      throw err;
    }
  }
}
