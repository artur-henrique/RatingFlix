import { apiFetch } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";
import type { ReviewWithAuthor } from "@/features/reviews/types";

export function toggleFollow(userId: string, token: string) {
  return apiFetch<{ following: boolean }>(`/profiles/${userId}/follow`, {
    method: "POST",
    token,
  });
}

export function getFeed(page: number, token: string) {
  const params = new URLSearchParams({ page: String(page) });
  return apiFetch<{ reviews: Paginated<ReviewWithAuthor> }>(`/feed?${params.toString()}`, { token });
}
