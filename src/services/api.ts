import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_ENDPOINT_LOCAL ||
  import.meta.env.VITE_API_ENDPOINT_DEVELOPMENT ||
  import.meta.env.VITE_API_ENDPOINT_PRODUCTION;

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor — attach token if available
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

// Response Interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default api;
