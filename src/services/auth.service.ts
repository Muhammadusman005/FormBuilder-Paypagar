import api from './api';
import { API_ENDPOINTS } from './endpoints';

export interface LoginPayload {
  email: string;
  password: string;
}

export const AuthService = {
  login: async (payload: LoginPayload) => {
    const response: any = await api.post(API_ENDPOINTS.LOGIN, payload);
    if (response?.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};
