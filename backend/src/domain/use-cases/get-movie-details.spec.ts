import { describe, it, expect, beforeEach } from "vitest";
import { GetMovieDetailsUseCase } from "./get-movie-details.js";
import { MockMovieService } from "../../test/services/mock-movie-service.js";

let movieService: MockMovieService;
let sut: GetMovieDetailsUseCase;

describe("Get Movie Details Use Case", () => {
  beforeEach(() => {
    movieService = new MockMovieService();
    sut = new GetMovieDetailsUseCase(movieService);
  });

  it("should be able to fetch movie details (using test double)", async () => {
    const { movie } = await sut.execute({ id: "550", mediaType: "movie" });

    expect(movie).not.toBeNull();
    expect(movie).toMatchObject({
      id: "550",
      title: "Clube da Luta",
      voteAverage: 8.4,
    });
  });

  it("should return null if movie details are not found", async () => {
    const { movie } = await sut.execute({ id: "non-existent-id", mediaType: "movie" });

    expect(movie).toBeNull();
  });
});
