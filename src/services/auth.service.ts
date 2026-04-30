import api from './axios';
import { ENDPOINTS } from './endpoints';
import { AUTH_TOKEN_KEY as TOKEN_KEY, AUTH_USER_KEY as USER_KEY } from '../constants';

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

// API response envelope shape
interface LoginResponse {
  success: boolean;
  message: string;
  data: AuthUser;
  statusCode: number;
}

export const AuthService = {
  login: async (payload: LoginPayload): Promise<AuthUser> => {
    // Interceptor unwraps axios response.data → we get the envelope directly
    // Shape: { success: true, data: { id, email, token, ... } }
    const res = await api.post<LoginResponse, LoginResponse>(ENDPOINTS.LOGIN, payload);
    const user = res.data;

    localStorage.setItem(TOKEN_KEY, user.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),

  getUser: (): AuthUser | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },

  isAuthenticated: (): boolean => !!localStorage.getItem(TOKEN_KEY),
};
