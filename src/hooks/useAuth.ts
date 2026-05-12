/**
 * useAuth
 *
 * Centralized authentication state and logic.
 * Provides user info, login/logout, and authentication status.
 *
 * Usage:
 *   const { user, isAuthenticated, login, logout } = useAuth();
 */
import { useState, useCallback, useEffect } from 'react';
import { AuthService, type AuthUser, type LoginPayload } from '../services/auth.service';

export interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedUser = AuthService.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {  
    setLoading(true);
    setError(null);
    try {
      const authUser = await AuthService.login(payload);
      setUser(authUser);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    AuthService.logout();
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout,
    clearError,
  };
}
