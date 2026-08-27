import { FastifyReply, FastifyRequest } from "fastify";
import { TmdbMovieService } from "../../services/tmdb-movie-service.js";
import { GetMovieDetailsUseCase } from "../../../domain/use-cases/get-movie-details.js";

export class GetMovieDetailsController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id, mediaType } = request.params as { id: string; mediaType: "movie" | "tv" };

    const movieService = new TmdbMovieService();
    const getMovieDetailsUseCase = new GetMovieDetailsUseCase(movieService);

    const { movie } = await getMovieDetailsUseCase.execute({ id, mediaType });

    if (!movie) {
      return reply.status(404).send({ message: "Movie or series details not found." });
    }

    return reply.status(200).send({ movie });
  }
}
