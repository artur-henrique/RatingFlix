import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api-client";
import { createReview, deleteReview, getMovieReviews, updateReview, voteOnReview } from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

const mockReview = {
  id: "r1",
  userId: "u1",
  tmdbId: "603",
  mediaType: "movie" as const,
  rating: 5,
  content: "Ótimo filme",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("getMovieReviews", () => {
  it("builds the query string with mediaType and page", async () => {
    const paginated = { items: [], total: 0, page: 1, perPage: 10 };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ reviews: paginated }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await getMovieReviews("603", "movie", 2);

    expect(result.reviews).toEqual(paginated);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("/movies/603/reviews?mediaType=movie&page=2");
  });
});

describe("createReview", () => {
  it("posts with the Authorization header", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ review: mockReview }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await createReview(
      { tmdbId: "603", mediaType: "movie", rating: 5, content: "Ótimo filme" },
      "fake-token"
    );

    expect(result.review).toEqual(mockReview);
    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer fake-token");
    expect(options.method).toBe("POST");
  });

  it("throws ApiError 409 when the user already reviewed this title", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ message: "Review already exists." }), { status: 409 })
      );
    vi.stubGlobal("fetch", fetchMock);

    try {
      await createReview({ tmdbId: "603", mediaType: "movie", rating: 5 }, "fake-token");
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(409);
    }
  });
});

describe("updateReview", () => {
  it("sends a PUT with the new rating/content", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ review: mockReview }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await updateReview("r1", { rating: 4, content: "Revi minha opinião" }, "fake-token");

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/reviews/r1");
    expect(options.method).toBe("PUT");
  });
});

describe("deleteReview", () => {
  it("sends a DELETE and handles the 204 response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await deleteReview("r1", "fake-token");

    expect(result).toBeUndefined();
    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe("DELETE");
  });
});

describe("voteOnReview", () => {
  it("posts the vote type and returns the toggle result", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ voted: true, type: "upvote" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await voteOnReview("r1", "upvote", "fake-token");

    expect(result).toEqual({ voted: true, type: "upvote" });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/reviews/r1/votes");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({ type: "upvote" });
  });

  it("throws ApiError 400 when voting on your own review", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ message: "You cannot vote on your own review." }), { status: 400 })
      );
    vi.stubGlobal("fetch", fetchMock);

    try {
      await voteOnReview("r1", "upvote", "fake-token");
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(400);
    }
  });
});
