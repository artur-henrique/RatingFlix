import { describe, expect, it } from "vitest";
import { decodeJwtPayload } from "./jwt";

function encodeBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fakeJwt(payload: object): string {
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = encodeBase64Url(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

describe("decodeJwtPayload", () => {
  it("decodes a well-formed token", () => {
    const token = fakeJwt({ sub: "user-123", username: "arthur" });
    expect(decodeJwtPayload(token)).toEqual({ sub: "user-123", username: "arthur" });
  });

  it("returns null for a malformed token", () => {
    expect(decodeJwtPayload("not-a-jwt")).toBeNull();
  });

  it("returns null when the payload is not valid base64/JSON", () => {
    expect(decodeJwtPayload("header.%%%.signature")).toBeNull();
  });
});
