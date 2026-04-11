import { useMutation } from "@tanstack/react-query";
import { api } from "../api/client";

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.post("/api/auth/login", credentials);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard";
      }
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem("token");
      return { success: true };
    },
    onSuccess: () => {
      localStorage.removeItem("token");
      window.location.href = "/";
    },
  });
}

export function useCurrentUser() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.get("/api/auth/me");
      return data;
    },
  });
}

