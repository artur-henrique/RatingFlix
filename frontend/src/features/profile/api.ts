import { apiFetch } from "@/lib/api-client";
import type { ProfileResponse } from "./types";

export function getUserProfile(username: string, page = 1, token?: string | null) {
  const params = new URLSearchParams({ page: String(page) });
  return apiFetch<ProfileResponse>(`/profiles/${encodeURIComponent(username)}?${params.toString()}`, {
    token,
  });
}
