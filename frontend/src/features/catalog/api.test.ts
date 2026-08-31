import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api-client";
import { getMovieDetails, searchMovies } from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("searchMovies", () => {
  it("encodes the query and returns the movies list", async () => {
    const mockMovies = [
      { id: "1", title: "Matrix", posterPath: null, releaseDate: "1999-03-31", mediaType: "movie" as const },
    ];
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ movies: mockMovies }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await searchMovies("matrix reloaded");

    expect(result.movies).toEqual(mockMovies);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("/movies/search?query=matrix%20reloaded");
  });
});

describe("getMovieDetails", () => {
  it("returns the movie details for a valid id", async () => {
    const mockMovie = {
      id: "603",
      title: "Matrix",
      overview: "...",
      posterPath: null,
      backdropPath: null,
      releaseDate: "1999-03-31",
      voteAverage: 8.2,
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ movie: mockMovie }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await getMovieDetails("movie", "603");

    expect(result.movie).toEqual(mockMovie);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("/movies/movie/603");
  });

  it("throws a 404 ApiError when the movie doesn't exist", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ message: "Movie or series details not found." }), {
          status: 404,
        })
      );
    vi.stubGlobal("fetch", fetchMock);

    try {
      await getMovieDetails("movie", "does-not-exist");
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(404);
    }
  });
});
