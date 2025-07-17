type ToastType = 'success' | 'error';

let showToast: ((message: string, type?: ToastType, duration?: number) => void) | null = null;

export const toast = {
  success: (message: string, duration?: number) => {
    showToast?.(message, 'success', duration);
  },
  error: (message: string, duration?: number) => {
    showToast?.(message, 'error', duration);
  },
  _register(fn: typeof showToast) {
    showToast = fn;
  }
};
