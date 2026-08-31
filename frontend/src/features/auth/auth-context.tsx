"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { login as loginRequest, registerUser as registerRequest } from "./api";
import { decodeJwtPayload } from "./jwt";
import {
  clearStoredToken,
  getServerToken,
  getStoredToken,
  setStoredToken,
  subscribeToken,
} from "./token-storage";
import type { AuthUser, LoginPayload, RegisterPayload } from "./types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  status: AuthStatus;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function userFromToken(token: string | null): AuthUser | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  return payload ? { id: payload.sub, username: payload.username } : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // useSyncExternalStore, não useEffect+setState: o token vive só no
  // localStorage (fonte única de verdade), e este hook é o jeito que o
  // próprio React recomenda para ler uma fonte de dados externa ao React
  // sem quebrar a hidratação. getServerToken() devolve undefined no
  // servidor/antes de hidratar; getStoredToken() devolve o valor real
  // (string ou null) assim que roda no navegador.
  const token = useSyncExternalStore(subscribeToken, getStoredToken, getServerToken);

  // Não existe endpoint "/me" no backend — decodificamos o payload do
  // próprio JWT (id + username) para restaurar a sessão sem uma chamada extra.
  const user = useMemo(() => userFromToken(token ?? null), [token]);

  const status: AuthStatus = token === undefined ? "loading" : user ? "authenticated" : "unauthenticated";

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await loginRequest(payload);
    setStoredToken(response.token);
  }, []);

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await registerRequest(payload);
      // POST /users não devolve token — logamos em seguida com as mesmas
      // credenciais para já entrar na conta recém-criada.
      await login({ email: payload.email, password: payload.password });
    },
    [login]
  );

  const logout = useCallback(() => {
    clearStoredToken();
  }, []);

  const value = useMemo(
    () => ({ user, token: token ?? null, status, login, register, logout }),
    [user, token, status, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
