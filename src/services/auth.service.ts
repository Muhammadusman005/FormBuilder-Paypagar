import api from './api';
import { API_ENDPOINTS } from './endpoints';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  isAdmin: boolean;
  companyName: string;
  roleName: string;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const AuthService = {
  login: async (payload: LoginPayload): Promise<AuthUser> => {
    // api interceptor returns response.data, so shape is { success, data, ... }
    const res: any = await api.post(API_ENDPOINTS.LOGIN, payload);
    const user: AuthUser = res.data;
    localStorage.setItem(TOKEN_KEY, user.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser: (): AuthUser | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};
