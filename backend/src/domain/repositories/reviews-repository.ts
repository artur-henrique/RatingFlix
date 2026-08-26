import { Review } from "../entities/review.js";

export interface ReviewsRepository {
  create(review: Review): Promise<Review>;
  save(review: Review): Promise<Review>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Review | null>;
  findByUserAndMedia(userId: string, tmdbId: string, mediaType: "movie" | "tv"): Promise<Review | null>;
  findManyByMovie(tmdbId: string, mediaType: "movie" | "tv"): Promise<Review[]>;
  findManyByUserId(userId: string): Promise<Review[]>;
}
