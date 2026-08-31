export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface RegisterResponse {
  user: AuthUser;
}
