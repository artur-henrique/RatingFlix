import { FastifyReply, FastifyRequest } from "fastify";
import { TmdbMovieService } from "../../services/tmdb-movie-service.js";
import { SearchMoviesUseCase } from "../../../domain/use-cases/search-movies.js";

export class SearchMoviesController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { query } = request.query as { query: string };

    const movieService = new TmdbMovieService();
    const searchMoviesUseCase = new SearchMoviesUseCase(movieService);

    const { movies } = await searchMoviesUseCase.execute({ query });

    return reply.status(200).send({ movies });
  }
}
