import { apiClient } from "@/lib/api";
import type { User, RegisterDto, LoginDto, LoginResponse } from "@/types";

export const authService = {
  async register(data: RegisterDto): Promise<User> {
    return apiClient.post<User>("/users/register", data);
  },

  async login(data: LoginDto): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/auth/login", data);
  },

  async getProfile(): Promise<User> {
    return apiClient.get<User>("/auth/profile");
  },
};
