import api from "./api";

export interface LoginPayload {
  email?: string;
  password?: string;
}

export const authService = {
  login: (data: LoginPayload) => api.post<{ user: any }>("/auth/login", data),
  register: (data: any) => api.post<{ user: any }>("/auth/register", data),
  me: () => api.get<{ user: any }>("/auth/me"),
  logout: () => api.post("/auth/logout"),
  resetpassword: (email:string) => api.post<{user:any}>("/auth/reset-password",email),
};
