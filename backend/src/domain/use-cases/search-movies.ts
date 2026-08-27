import { z } from "zod";
import { MovieService, SearchMovieResult } from "../services/movie-service.js";

const searchMoviesSchema = z.object({
  query: z.string().min(1, "Query is required"),
});

type SearchMoviesRequest = z.infer<typeof searchMoviesSchema>;

interface SearchMoviesResponse {
  movies: SearchMovieResult[];
}

export class SearchMoviesUseCase {
  constructor(private movieService: MovieService) {}

  async execute(request: SearchMoviesRequest): Promise<SearchMoviesResponse> {
    const { query } = searchMoviesSchema.parse(request);
    const movies = await this.movieService.searchMovies(query);
    return { movies };
  }
}
