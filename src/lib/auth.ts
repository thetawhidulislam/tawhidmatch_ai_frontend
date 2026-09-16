import { api } from "@/lib/api";
import type { ApiSuccess, AuthResponse } from "@/types";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  const res = await api.post<ApiSuccess<AuthResponse>>("/auth/register", input);
  return res.data.data;
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const res = await api.post<ApiSuccess<AuthResponse>>("/auth/login", input);
  return res.data.data;
}
