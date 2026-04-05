import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getTokens, isTokenExpired, refreshAccessToken, clearTokens } from './auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Request interceptor — attach token, auto-refresh if near expiry ─────────

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  let tokens = getTokens();

  // If token is expired or about to expire, refresh first
  if (tokens && isTokenExpired()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      tokens = refreshed;
    } else {
      // Refresh failed — let the request go through, 401 interceptor will handle it
      tokens = null;
    }
  }

  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  return config;
});

// ─── Response interceptor — retry once on 401, then redirect ─────────────────

let isRetrying = false;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Only retry once for 401s
    if (error.response?.status === 401 && originalRequest && !isRetrying) {
      isRetrying = true;

      const refreshed = await refreshAccessToken();
      isRetrying = false;

      if (refreshed && originalRequest) {
        originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
        return api(originalRequest);
      }

      // Refresh failed — clear state and redirect
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/phone';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
