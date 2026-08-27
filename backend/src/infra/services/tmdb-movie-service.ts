import { MovieDetails, MovieService, SearchMovieResult } from "../../domain/services/movie-service.js";

export class TmdbMovieService implements MovieService {
  private baseUrl = "https://api.themoviedb.org/3";
  private token: string;

  constructor() {
    this.token = process.env.TMDB_API_BEARER_TOKEN || "";
    if (!this.token) {
      console.warn("Warning: TMDB_API_BEARER_TOKEN is not configured in environment variables.");
    }
  }

  private getHeaders() {
    return {
      accept: "application/json",
      Authorization: `Bearer ${this.token}`,
    };
  }

  async searchMovies(query: string): Promise<SearchMovieResult[]> {
    try {
      const url = `${this.baseUrl}/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=pt-BR&page=1`;
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      return (data.results || [])
        .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
        .map((item: any) => ({
          id: String(item.id),
          title: item.title || item.name || "",
          posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          releaseDate: item.release_date || item.first_air_date || "",
          mediaType: item.media_type as "movie" | "tv",
        }));
    } catch (error) {
      console.error("Error searching movies on TMDB:", error);
      throw new Error("Failed to search movies from external provider.");
    }
  }

  async getMovieDetails(id: string, mediaType: "movie" | "tv"): Promise<MovieDetails | null> {
    try {
      const url = `${this.baseUrl}/${mediaType}/${id}?language=pt-BR`;
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      return {
        id: String(data.id),
        title: data.title || data.name || "",
        overview: data.overview || "",
        posterPath: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
        backdropPath: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
        releaseDate: data.release_date || data.first_air_date || "",
        voteAverage: data.vote_average || 0,
      };
    } catch (error) {
      console.error("Error fetching movie details from TMDB:", error);
      throw new Error("Failed to fetch movie details from external provider.");
    }
  }
}
