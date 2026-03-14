'use client';

import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { AxiosRequestConfig, AxiosError } from 'axios';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T = unknown>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const request = useCallback(
    async (config: AxiosRequestConfig): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await api.request<T>(config);
        setState({ data: response.data, loading: false, error: null });
        return response.data;
      } catch (err) {
        const axiosError = err as AxiosError<{ detail?: string }>;
        const message =
          axiosError.response?.data?.detail ||
          axiosError.message ||
          'Something went wrong';
        setState({ data: null, loading: false, error: message });
        return null;
      }
    },
    []
  );

  const get = useCallback(
    (url: string, config?: AxiosRequestConfig) =>
      request({ ...config, method: 'GET', url }),
    [request]
  );

  const post = useCallback(
    (url: string, data?: unknown, config?: AxiosRequestConfig) =>
      request({ ...config, method: 'POST', url, data }),
    [request]
  );

  const put = useCallback(
    (url: string, data?: unknown, config?: AxiosRequestConfig) =>
      request({ ...config, method: 'PUT', url, data }),
    [request]
  );

  const patch = useCallback(
    (url: string, data?: unknown, config?: AxiosRequestConfig) =>
      request({ ...config, method: 'PATCH', url, data }),
    [request]
  );

  const del = useCallback(
    (url: string, config?: AxiosRequestConfig) =>
      request({ ...config, method: 'DELETE', url }),
    [request]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    request,
    get,
    post,
    put,
    patch,
    del,
    reset,
  };
}
