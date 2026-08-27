import { prisma } from "../../../../shared/infra/database/prisma.js";
import { Review } from "../../../../domain/entities/review.js";
import { ReviewsRepository, ReviewWithAuthor } from "../../../../domain/repositories/reviews-repository.js";
import { Paginated, PaginationParams } from "../../../../domain/repositories/pagination.js";

export class PrismaReviewsRepository implements ReviewsRepository {
  async create(review: Review): Promise<Review> {
    await prisma.review.create({
      data: {
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

    return review;
  }

  async save(review: Review): Promise<Review> {
    await prisma.review.update({
      where: { id: review.id },
      data: {
        rating: review.rating,
        content: review.content,
        updatedAt: review.updatedAt,
      },
    });

    return review;
  }

  async delete(id: string): Promise<void> {
    await prisma.review.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<Review | null> {
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return null;
    }

    return new Review({
      id: review.id,
      userId: review.userId,
      tmdbId: review.tmdbId,
      mediaType: review.mediaType as "movie" | "tv",
      rating: review.rating,
      content: review.content,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    });
  }

  async findByUserAndMedia(userId: string, tmdbId: string, mediaType: "movie" | "tv"): Promise<Review | null> {
    const review = await prisma.review.findFirst({
      where: {
        userId,
        tmdbId,
        mediaType,
      },
    });

    if (!review) {
      return null;
    }

    return new Review({
      id: review.id,
      userId: review.userId,
      tmdbId: review.tmdbId,
      mediaType: review.mediaType as "movie" | "tv",
      rating: review.rating,
      content: review.content,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    });
  }

  async findManyByMovie(tmdbId: string, mediaType: "movie" | "tv"): Promise<Review[]> {
    const reviews = await prisma.review.findMany({
      where: {
        tmdbId,
        mediaType,
      },
    });

    return reviews.map(
      (review: any) =>
        new Review({
          id: review.id,
          userId: review.userId,
          tmdbId: review.tmdbId,
          mediaType: review.mediaType as "movie" | "tv",
          rating: review.rating,
          content: review.content,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        })
    );
  }

  async findManyByUserId(userId: string): Promise<Review[]> {
    const reviews = await prisma.review.findMany({
      where: {
        userId,
      },
    });

    return reviews.map(
      (review: any) =>
        new Review({
          id: review.id,
          userId: review.userId,
          tmdbId: review.tmdbId,
          mediaType: review.mediaType as "movie" | "tv",
          rating: review.rating,
          content: review.content,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        })
    );
  }

  async findManyByMoviePaginated(
    tmdbId: string,
    mediaType: "movie" | "tv",
    { page, perPage }: PaginationParams
  ): Promise<Paginated<ReviewWithAuthor>> {
    const where = { tmdbId, mediaType };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: { user: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.review.count({ where }),
    ]);

    return {
      items: reviews.map((review: any) => ({
        id: review.id,
        tmdbId: review.tmdbId,
        mediaType: review.mediaType as "movie" | "tv",
        rating: review.rating,
        content: review.content,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        author: {
          id: review.user.id,
          username: review.user.username,
          avatarUrl: review.user.avatarUrl,
        },
      })),
      total,
      page,
      perPage,
    };
  }

  async findManyByUserIdPaginated(userId: string, { page, perPage }: PaginationParams): Promise<Paginated<Review>> {
    const where = { userId };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.review.count({ where }),
    ]);

    return {
      items: reviews.map(
        (review: any) =>
          new Review({
            id: review.id,
            userId: review.userId,
            tmdbId: review.tmdbId,
            mediaType: review.mediaType as "movie" | "tv",
            rating: review.rating,
            content: review.content,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
          })
      ),
      total,
      page,
      perPage,
    };
  }
}
