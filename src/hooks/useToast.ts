/**
 * useToast
 *
 * Hook for showing toast notifications.
 * Provides a simple API for displaying success, error, info, and warning messages.
 *
 * Usage:
 *   const { success, error, info, warning } = useToast();
 *   success('Form saved successfully!');
 *   error('Failed to save form');
 */
import { useCallback } from 'react';
import {
  showSuccess,
  showError,
  showInfo,
  showWarning,
  showToast,
  type ToastType,
} from '../utils/toast';

export interface UseToastReturn {
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  show: (type: ToastType, message: string, duration?: number) => string;
}

export function useToast(): UseToastReturn {
  const success = useCallback(showSuccess, []);
  const error = useCallback(showError, []);
  const info = useCallback(showInfo, []);
  const warning = useCallback(showWarning, []);
  const show = useCallback(showToast, []);

  return { success, error, info, warning, show };
}
