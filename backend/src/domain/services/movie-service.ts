export interface MovieDetails {
  id: string;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  voteAverage: number;
}

export interface SearchMovieResult {
  id: string;
  title: string;
  posterPath: string | null;
  releaseDate: string;
  mediaType: "movie" | "tv";
}

export interface MovieService {
  searchMovies(query: string): Promise<SearchMovieResult[]>;
  getMovieDetails(id: string, mediaType: "movie" | "tv"): Promise<MovieDetails | null>;
}
