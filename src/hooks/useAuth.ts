import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from 'react';
import { api } from "../api/client";

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.post("/api/auth/login", credentials);
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.user) {
        try { localStorage.setItem("user", JSON.stringify(data.user)); } catch {}
      }
      window.location.href = "/dashboard";
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // await api.post("/api/auth/logout");
      try { localStorage.removeItem("user"); } catch {}
      return { success: true };
    },
    onSuccess: () => {
      try { localStorage.removeItem("user"); } catch {}
      queryClient.clear();
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

interface AuthStatus {
  isAuthenticated: boolean;
  isBanned: boolean;
  isFrozen: boolean;
  isLoading: boolean;
}

export const useAuthStatus = (): AuthStatus => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.get("/api/auth/me");
        if (data) {
          setIsAuthenticated(true);
          setIsBanned(data.banned || false);
          setIsFrozen(data.frozen || false);
          return;
        }
      } catch {
        setIsAuthenticated(false);
        setIsBanned(false);
        setIsFrozen(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, isBanned, isFrozen, isLoading };
};

