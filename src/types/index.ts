export type Role = "USER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  github?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
}

export interface UserWithProfile extends User {
  profile: Profile | null;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  code: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
