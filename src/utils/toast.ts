/**
 * Toast notification system
 *
 * Centralized toast/notification management.
 * Can be extended to use a toast library like react-hot-toast or sonner.
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// Simple in-memory store for toasts
// In a real app, this would be managed by a context or state management library
let toastListeners: Set<(toast: Toast) => void> = new Set();
let toastId = 0;

/**
 * Subscribe to toast events
 */
export function onToast(callback: (toast: Toast) => void): () => void {
  toastListeners.add(callback);
  return () => toastListeners.delete(callback);
}

/**
 * Emit a toast notification
 */
function emitToast(toast: Toast) {
  toastListeners.forEach(listener => listener(toast));
}

/**
 * Show a success toast
 */
export function showSuccess(message: string, duration = 3000) {
  const toast: Toast = {
    id: `toast-${++toastId}`,
    type: 'success',
    message,
    duration,
  };
  emitToast(toast);
  return toast.id;
}

/**
 * Show an error toast
 */
export function showError(message: string, duration = 5000) {
  const toast: Toast = {
    id: `toast-${++toastId}`,
    type: 'error',
    message,
    duration,
  };
  emitToast(toast);
  return toast.id;
}

/**
 * Show an info toast
 */
export function showInfo(message: string, duration = 3000) {
  const toast: Toast = {
    id: `toast-${++toastId}`,
    type: 'info',
    message,
    duration,
  };
  emitToast(toast);
  return toast.id;
}

/**
 * Show a warning toast
 */
export function showWarning(message: string, duration = 4000) {
  const toast: Toast = {
    id: `toast-${++toastId}`,
    type: 'warning',
    message,
    duration,
  };
  emitToast(toast);
  return toast.id;
}

/**
 * Show a custom toast
 */
export function showToast(type: ToastType, message: string, duration?: number) {
  const toast: Toast = {
    id: `toast-${++toastId}`,
    type,
    message,
    duration,
  };
  emitToast(toast);
  return toast.id;
}
