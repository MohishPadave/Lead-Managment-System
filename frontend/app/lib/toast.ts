export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;

export const createToast = (message: string, type: ToastType = 'info'): Toast => {
  return {
    id: toastId++,
    message,
    type,
  };
};
