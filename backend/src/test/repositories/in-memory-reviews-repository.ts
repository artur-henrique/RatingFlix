import { Review } from "../../domain/entities/review.js";
import { ReviewsRepository, ReviewWithAuthor } from "../../domain/repositories/reviews-repository.js";
import { Paginated, PaginationParams } from "../../domain/repositories/pagination.js";
import { InMemoryUsersRepository } from "./in-memory-users-repository.js";

export class InMemoryReviewsRepository implements ReviewsRepository {
  public items: Review[] = [];

  constructor(private usersRepository?: InMemoryUsersRepository) {}

  async create(review: Review): Promise<Review> {
    this.items.push(review);
    return review;
  }

  async save(review: Review): Promise<Review> {
    const index = this.items.findIndex((item) => item.id === review.id);
    if (index >= 0) {
      this.items[index] = review;
    }
    return review;
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index >= 0) {
      this.items.splice(index, 1);
    }
  }

  async findById(id: string): Promise<Review | null> {
    const review = this.items.find((item) => item.id === id);
    return review ?? null;
  }

  async findByUserAndMedia(userId: string, tmdbId: string, mediaType: "movie" | "tv"): Promise<Review | null> {
    const review = this.items.find(
      (item) => item.userId === userId && item.tmdbId === tmdbId && item.mediaType === mediaType
    );
    return review ?? null;
  }

  async findManyByMovie(tmdbId: string, mediaType: "movie" | "tv"): Promise<Review[]> {
    return this.items.filter((item) => item.tmdbId === tmdbId && item.mediaType === mediaType);
  }

  async findManyByUserId(userId: string): Promise<Review[]> {
    return this.items.filter((item) => item.userId === userId);
  }

  async findManyByMoviePaginated(
    tmdbId: string,
    mediaType: "movie" | "tv",
    { page, perPage }: PaginationParams
  ): Promise<Paginated<ReviewWithAuthor>> {
    const matching = this.items.filter((item) => item.tmdbId === tmdbId && item.mediaType === mediaType);
    return this.paginateWithAuthor(matching, page, perPage);
  }

  async findManyByUserIdPaginated(userId: string, { page, perPage }: PaginationParams): Promise<Paginated<Review>> {
    const matching = this.items
      .filter((item) => item.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const start = (page - 1) * perPage;
    const items = matching.slice(start, start + perPage);

    return { items, total: matching.length, page, perPage };
  }

  async findManyByAuthorsPaginated(
    authorIds: string[],
    { page, perPage }: PaginationParams
  ): Promise<Paginated<ReviewWithAuthor>> {
    const matching = this.items.filter((item) => authorIds.includes(item.userId));
    return this.paginateWithAuthor(matching, page, perPage);
  }

  private paginateWithAuthor(matching: Review[], page: number, perPage: number): Paginated<ReviewWithAuthor> {
    const sorted = matching.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const start = (page - 1) * perPage;
    const items = sorted.slice(start, start + perPage).map((review) => {
      const author = this.usersRepository?.items.find((user) => user.id === review.userId);

      return {
        id: review.id,
        tmdbId: review.tmdbId,
        mediaType: review.mediaType,
        rating: review.rating,
        content: review.content,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        author: {
          id: author?.id ?? review.userId,
          username: author?.username ?? "unknown",
          avatarUrl: author?.avatarUrl ?? null,
        },
      };
    });

    return { items, total: sorted.length, page, perPage };
  }
}
