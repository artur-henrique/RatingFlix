import { afterEach, describe, expect, it, vi } from "vitest";
import { getFeed, toggleFollow } from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("toggleFollow", () => {
  it("posts to /profiles/:userId/follow with the Authorization header", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ following: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await toggleFollow("user-123", "fake-token");

    expect(result).toEqual({ following: true });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/profiles/user-123/follow");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe("Bearer fake-token");
  });
});

describe("getFeed", () => {
  it("builds the query string with the page and sends the token", async () => {
    const paginated = { items: [], total: 0, page: 2, perPage: 10 };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ reviews: paginated }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await getFeed(2, "fake-token");

    expect(result.reviews).toEqual(paginated);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/feed?page=2");
    expect(options.headers.Authorization).toBe("Bearer fake-token");
  });
});
