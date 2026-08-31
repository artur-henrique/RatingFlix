import { apiFetch } from "@/lib/api-client";
import type { MediaType } from "@/features/catalog/types";
import type {
  CreateReviewPayload,
  Paginated,
  Review,
  ReviewWithAuthor,
  UpdateReviewPayload,
} from "./types";

export function getMovieReviews(tmdbId: string, mediaType: MediaType, page = 1) {
  const params = new URLSearchParams({ mediaType, page: String(page) });
  return apiFetch<{ reviews: Paginated<ReviewWithAuthor> }>(
    `/movies/${tmdbId}/reviews?${params.toString()}`
  );
}

export function createReview(payload: CreateReviewPayload, token: string) {
  return apiFetch<{ review: Review }>("/reviews", { method: "POST", body: payload, token });
}

export function updateReview(reviewId: string, payload: UpdateReviewPayload, token: string) {
  return apiFetch<{ review: Review }>(`/reviews/${reviewId}`, {
    method: "PUT",
    body: payload,
    token,
  });
}

export function deleteReview(reviewId: string, token: string) {
  return apiFetch<void>(`/reviews/${reviewId}`, { method: "DELETE", token });
}
