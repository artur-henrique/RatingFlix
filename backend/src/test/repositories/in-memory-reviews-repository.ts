import { Review } from "../../domain/entities/review.js";
import { ReviewsRepository } from "../../domain/repositories/reviews-repository.js";

export class InMemoryReviewsRepository implements ReviewsRepository {
  public items: Review[] = [];

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
}
