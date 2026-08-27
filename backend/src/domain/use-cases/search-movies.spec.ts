import { describe, it, expect, beforeEach } from "vitest";
import { SearchMoviesUseCase } from "./search-movies.js";
import { MockMovieService } from "../../test/services/mock-movie-service.js";

let movieService: MockMovieService;
let sut: SearchMoviesUseCase;

describe("Search Movies Use Case", () => {
  beforeEach(() => {
    movieService = new MockMovieService();
    sut = new SearchMoviesUseCase(movieService);
  });

  it("should be able to search movies by query (using test double)", async () => {
    const { movies } = await sut.execute({ query: "clube" });

    expect(movies).toHaveLength(1);
    expect(movies[0]).toMatchObject({
      id: "550",
      title: "Clube da Luta",
      mediaType: "movie",
    });
  });

  it("should return empty array if no movie matches the query", async () => {
    const { movies } = await sut.execute({ query: "non-existent-movie-query" });

    expect(movies).toHaveLength(0);
  });
});
