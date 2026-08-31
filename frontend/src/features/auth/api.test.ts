import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api-client";
import { login, registerUser } from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("registerUser", () => {
  it("posts to /users and returns the created user", async () => {
    const mockUser = {
      id: "1",
      username: "arthur",
      email: "arthur@example.com",
      avatarUrl: null,
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ user: mockUser }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await registerUser({
      username: "arthur",
      email: "arthur@example.com",
      password: "123456",
    });

    expect(result.user).toEqual(mockUser);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/users");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({
      username: "arthur",
      email: "arthur@example.com",
      password: "123456",
    });
  });

  it("throws ApiError with the backend message when the account already exists", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ message: "Username already exists." }), { status: 409 })
      );
    vi.stubGlobal("fetch", fetchMock);

    try {
      await registerUser({ username: "arthur", email: "arthur@example.com", password: "123456" });
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(409);
      expect((err as ApiError).message).toBe("Username already exists.");
    }
  });
});

describe("login", () => {
  it("posts to /sessions and returns user + token", async () => {
    const mockResponse = {
      user: { id: "1", username: "arthur" },
      token: "jwt-token",
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(mockResponse), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await login({ email: "arthur@example.com", password: "123456" });

    expect(result).toEqual(mockResponse);
    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe("POST");
  });

  it("throws ApiError on invalid credentials", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ message: "Invalid credentials." }), { status: 400 })
      );
    vi.stubGlobal("fetch", fetchMock);

    try {
      await login({ email: "arthur@example.com", password: "wrong" });
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).message).toBe("Invalid credentials.");
    }
  });
});
