export type MediaType = "movie" | "tv";

export interface SearchResult {
  id: string;
  title: string;
  posterPath: string | null;
  releaseDate: string;
  mediaType: MediaType;
}

export interface MovieDetails {
  id: string;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  voteAverage: number;
}
