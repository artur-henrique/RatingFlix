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
  createdAt: string;
  updatedAt: string;
}

export interface ReviewWithAuthor {
  id: string;
  tmdbId: string;
  mediaType: MediaType;
  rating: number;
  content: string | null;
  createdAt: string;
  updatedAt: string;
  author: ReviewAuthor;
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
