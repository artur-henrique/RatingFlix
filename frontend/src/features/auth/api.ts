import { apiFetch } from "@/lib/api-client";
import type { AuthResponse, LoginPayload, RegisterPayload, RegisterResponse } from "./types";

export function registerUser(payload: RegisterPayload) {
  return apiFetch<RegisterResponse>("/users", {
    method: "POST",
    body: payload,
  });
}

export function login(payload: LoginPayload) {
  return apiFetch<AuthResponse>("/sessions", {
    method: "POST",
    body: payload,
  });
}
