import axios from "axios";

// In development use the local backend unless VITE_API_URL overrides it.
// In production default to same-origin API requests unless VITE_API_URL is set.
const API_BASE_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? 'http://localhost:4000' : '');

export const api = axios.create({
  baseURL: API_BASE_URL || undefined,
  withCredentials: true, // Include cookies in requests
});

// Add response interceptor to handle 401 (cookie/token invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem("user");
      } catch {}
      
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      } else if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export async function fetchJson<T = any>(endpoint: string, options: any = {}) {
  const { body, headers, ...rest } = options;
  const requestConfig: any = {
    url: endpoint,
    ...rest,
    headers: {
      ...headers,
    },
  };

  if (body !== undefined) {
    requestConfig.data = body;
    requestConfig.headers = {
      'Content-Type': 'application/json',
      ...requestConfig.headers,
    };
  }

  const response = await api.request(requestConfig);
  return response.data as T;
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}) {
  const { body, ...rest } = options;
  const requestConfig: any = {
    url: endpoint,
    method: rest.method || 'GET',
    headers: rest.headers,
    params: (rest as any).params,
  };

  if (body !== undefined) {
    requestConfig.data = typeof body === 'string'
      ? JSON.parse(body as string)
      : body;
  }

  const response = await api.request(requestConfig);
  return response.data as T;
}

export function clearAuthStorage() {
  try {
    localStorage.removeItem("user");
    localStorage.removeItem("adminToken");
  } catch {}
}

export default api;
