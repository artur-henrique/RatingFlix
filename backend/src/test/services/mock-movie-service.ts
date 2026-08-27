import { MovieDetails, MovieService, SearchMovieResult } from "../../domain/services/movie-service.js";

export class MockMovieService implements MovieService {
  async searchMovies(query: string): Promise<SearchMovieResult[]> {
    const mockMovies = [
      { id: "550", title: "Clube da Luta", posterPath: "https://image.tmdb.org/t/p/w500/b9g7YclG97TidIl797gIIT9OC6V.jpg", releaseDate: "1999-10-15", mediaType: "movie" as const },
      { id: "27205", title: "A Origem", posterPath: "https://image.tmdb.org/t/p/w500/9gk7adHYvHCm0Xys696YOBi6h8b.jpg", releaseDate: "2010-07-15", mediaType: "movie" as const },
      { id: "1396", title: "Breaking Bad", posterPath: "https://image.tmdb.org/t/p/w500/ggwsD6SNoZ890KzG6S9pZitUoWv.jpg", releaseDate: "2008-01-20", mediaType: "tv" as const },
    ];

    return mockMovies.filter((movie) => movie.title.toLowerCase().includes(query.toLowerCase()));
  }

  async getMovieDetails(id: string, mediaType: "movie" | "tv"): Promise<MovieDetails | null> {
    if (id === "550" && mediaType === "movie") {
      return {
        id: "550",
        title: "Clube da Luta",
        overview: "Um homem deprimido que sofre de insônia conhece um estranho vendedor de sabonetes chamado Tyler Durden.",
        posterPath: "https://image.tmdb.org/t/p/w500/b9g7YclG97TidIl797gIIT9OC6V.jpg",
        backdropPath: "https://image.tmdb.org/t/p/original/hZ88Yg766g9I7889vV7I88vYg76.jpg",
        releaseDate: "1999-10-15",
        voteAverage: 8.4,
      };
    }

    if (id === "27205" && mediaType === "movie") {
      return {
        id: "27205",
        title: "A Origem",
        overview: "Dom Cobb é um ladrão habilidoso que rouba segredos valiosos das profundezas do subconsciente durante o estado de sono.",
        posterPath: "https://image.tmdb.org/t/p/w500/9gk7adHYvHCm0Xys696YOBi6h8b.jpg",
        backdropPath: "https://image.tmdb.org/t/p/original/tM8Z3UfV16972G77v6i6m7n9V9I.jpg",
        releaseDate: "2010-07-15",
        voteAverage: 8.3,
      };
    }

    if (id === "1396" && mediaType === "tv") {
      return {
        id: "1396",
        title: "Breaking Bad",
        overview: "Um professor de química do ensino médio diagnosticado com câncer de pulmão terminal se une a um ex-aluno para fabricar e vender metanfetamina.",
        posterPath: "https://image.tmdb.org/t/p/w500/ggwsD6SNoZ890KzG6S9pZitUoWv.jpg",
        backdropPath: "https://image.tmdb.org/t/p/original/e9YvGZ168v7G67v169Gv7h9V9I.jpg",
        releaseDate: "2008-01-20",
        voteAverage: 8.9,
      };
    }

    return null;
  }
}
