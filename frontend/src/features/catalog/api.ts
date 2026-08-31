import { apiFetch } from "@/lib/api-client";
import type { MediaType, MovieDetails, SearchResult } from "./types";

export function searchMovies(query: string) {
  return apiFetch<{ movies: SearchResult[] }>(`/movies/search?query=${encodeURIComponent(query)}`);
}

export function getMovieDetails(mediaType: MediaType, id: string) {
  return apiFetch<{ movie: MovieDetails }>(`/movies/${mediaType}/${id}`);
}
