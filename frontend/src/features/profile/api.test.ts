import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api-client";
import { getUserProfile } from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getUserProfile", () => {
  it("builds the URL with the username and page", async () => {
    const mockResponse = {
      profile: {
        id: "u1",
        username: "arthur",
        avatarUrl: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        score: 10,
        badges: [],
      },
      reviews: { items: [], total: 0, page: 1, perPage: 10 },
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(mockResponse), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await getUserProfile("arthur", 2);

    expect(result).toEqual(mockResponse);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("/profiles/arthur?page=2");
  });

  it("throws a 404 ApiError when the user doesn't exist", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ message: "User not found." }), { status: 404 }));
    vi.stubGlobal("fetch", fetchMock);

    try {
      await getUserProfile("does-not-exist");
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(404);
    }
  });
});
