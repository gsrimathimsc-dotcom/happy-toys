import type { AuthResult, User } from "@/types";
import { apiRequest } from "./apiClient";

export function login(email: string, password: string): Promise<AuthResult> {
  return apiRequest({ url: "/api/users/login", method: "POST", data: { email, password } });
}

export function register(name: string, email: string, password: string): Promise<AuthResult> {
  return apiRequest({ url: "/api/users/register", method: "POST", data: { name, email, password } });
}

export function logout(): Promise<unknown> {
  return apiRequest({ url: "/api/users/logout", method: "POST" });
}

export function getProfile(): Promise<User> {
  return apiRequest({ url: "/api/users/profile" });
}
