import { Review } from "../entities/review.js";
import { Paginated, PaginationParams } from "./pagination.js";
import { ReviewVoteSummary } from "./votes-repository.js";

export interface ReviewAuthor {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface ReviewWithAuthor {
  id: string;
  tmdbId: string;
  mediaType: "movie" | "tv";
  rating: number;
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: ReviewAuthor;
}

// Usado pelos use cases que também enriquecem a review com votos
// (GetMovieReviewsUseCase, GetUserFeedUseCase) — o repositório de reviews
// não conhece votos, então isso não vive em ReviewWithAuthor diretamente.
export interface ReviewWithAuthorAndVotes extends ReviewWithAuthor {
  votes: ReviewVoteSummary;
}

export interface ReviewsRepository {
  create(review: Review): Promise<Review>;
  save(review: Review): Promise<Review>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Review | null>;
  findByUserAndMedia(userId: string, tmdbId: string, mediaType: "movie" | "tv"): Promise<Review | null>;
  findManyByMovie(tmdbId: string, mediaType: "movie" | "tv"): Promise<Review[]>;
  findManyByUserId(userId: string): Promise<Review[]>;
  findManyByMoviePaginated(
    tmdbId: string,
    mediaType: "movie" | "tv",
    params: PaginationParams
  ): Promise<Paginated<ReviewWithAuthor>>;
  findManyByUserIdPaginated(userId: string, params: PaginationParams): Promise<Paginated<Review>>;
  findManyByAuthorsPaginated(authorIds: string[], params: PaginationParams): Promise<Paginated<ReviewWithAuthor>>;
}
