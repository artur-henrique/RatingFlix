import type { MediaType } from "@/features/catalog/types";
import type { Paginated } from "@/lib/types";

export type { Paginated };

export interface ReviewAuthor {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface Review {
  id: string;
  userId: string;
  tmdbId: string;
  mediaType: MediaType;
  rating: number;
  content: string | null;
  movieTitle: string | null;
  moviePosterPath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewVotes {
  upvotes: number;
  downvotes: number;
  myVote: "upvote" | "downvote" | null;
}

export interface ReviewWithAuthor {
  id: string;
  tmdbId: string;
  mediaType: MediaType;
  rating: number;
  content: string | null;
  // Snapshot do filme/série resolvido pelo backend na criação da review
  // (Etapa 9) — sempre presente, mas só é exibido nos contextos onde o
  // filme não é óbvio pelo resto da tela (ex.: feed), via `showMovie` no
  // `ReviewCard`.
  movieTitle: string | null;
  moviePosterPath: string | null;
  createdAt: string;
  updatedAt: string;
  author: ReviewAuthor;
  // Presente desde a preparação de backend da Etapa 6; consumido de verdade
  // só na Etapa 7 (votos).
  votes: ReviewVotes;
}

export interface CreateReviewPayload {
  tmdbId: string;
  mediaType: MediaType;
  rating: number;
  content?: string;
}

export interface UpdateReviewPayload {
  rating: number;
  content?: string;
}
