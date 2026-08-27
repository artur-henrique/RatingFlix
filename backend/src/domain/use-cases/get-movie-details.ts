import { z } from "zod";
import { MovieDetails, MovieService } from "../services/movie-service.js";

const getMovieDetailsSchema = z.object({
  id: z.string().min(1, "Movie ID is required"),
  mediaType: z.enum(["movie", "tv"]),
});

type GetMovieDetailsRequest = z.infer<typeof getMovieDetailsSchema>;

interface GetMovieDetailsResponse {
  movie: MovieDetails | null;
}

export class GetMovieDetailsUseCase {
  constructor(private movieService: MovieService) {}

  async execute(request: GetMovieDetailsRequest): Promise<GetMovieDetailsResponse> {
    const { id, mediaType } = getMovieDetailsSchema.parse(request);
    const movie = await this.movieService.getMovieDetails(id, mediaType);
    return { movie };
  }
}
