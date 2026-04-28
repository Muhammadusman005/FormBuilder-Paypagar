import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

// Always use the dev URL in development, production URL in production
const baseURL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor — attach Bearer token ─────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — unwrap response.data ───────────────
// After this, every caller receives the parsed body directly.
// e.g. axios returns { data: { success, data: {...}, statusCode } }
//      interceptor returns          { success, data: {...}, statusCode }
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';

    // Auto-logout on expired / invalid token
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }

    console.error(`API Error [${error.response?.status}]:`, message);
    return Promise.reject(error);
  }
);

// ── Generic typed request helper ──────────────────────────────
const apiClient = <T>(
  url: string,
  body?: Record<string, unknown> | FormData,
  method: 'get' | 'post' | 'put' | 'patch' | 'delete' = 'get',
  extraHeaders?: AxiosRequestConfig['headers']
): Promise<T> =>
  api.request<T, T>({ url, method, data: body, headers: extraHeaders });

export const get   = <T>(url: string) =>
  apiClient<T>(url, undefined, 'get');

export const post  = <T>(url: string, body: Record<string, unknown> | FormData, extraHeaders?: AxiosRequestConfig['headers']) =>
  apiClient<T>(url, body, 'post', extraHeaders);

export const put   = <T>(url: string, body: Record<string, unknown> | FormData) =>
  apiClient<T>(url, body, 'put');

export const patch = <T>(url: string, body: Record<string, unknown> | FormData) =>
  apiClient<T>(url, body, 'patch');

export const del   = <T>(url: string, body?: Record<string, unknown> | FormData) =>
  apiClient<T>(url, body, 'delete');

export default api;
