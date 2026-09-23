import { api } from "./api";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: "user" | "admin";
}

export interface AuthResponse {
  user: UserProfile;
  token?: string;
}

export interface MeResponse {
  user: UserProfile;
  riskProfile: any;
  killSwitchEngaged: boolean;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>("/auth/login", { email, password });
  },

  register: async (displayName: string, email: string, password: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>("/auth/register", { displayName, email, password });
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  getMe: async (): Promise<MeResponse> => {
    return api.get<MeResponse>("/auth/me");
  },
};
