
import { toast as sonnerToast } from "sonner";
import { useState, useCallback } from "react";

// Define types for toast options to match existing usage
export type ToastOptions = {
  id?: string | number;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
  action?: React.ReactNode;
};

// Create a toast state management system
export function useToast() {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    const { title, description, variant, ...rest } = options;
    
    // Generate a unique ID for the toast
    const id = Date.now();
    
    // Create toast object
    const newToast: ToastOptions = {
      id,
      title,
      description,
      variant,
      ...rest
    };

    // Add toast to state
    setToasts(currentToasts => [...currentToasts, newToast]);

    // Use sonner for actual toast rendering
    switch (variant) {
      case "destructive":
        sonnerToast.error(title || "", {
          description,
          ...rest
        });
        break;
      case "success":
        sonnerToast.success(title || "", {
          description,
          ...rest
        });
        break;
      default:
        sonnerToast(title || "", {
          description,
          ...rest
        });
    }

    return id;
  }, []);

  // Function to dismiss a specific toast
  const dismiss = useCallback((toastId?: string | number) => {
    setToasts(currentToasts => 
      currentToasts.filter(toast => toast.id !== toastId)
    );
  }, []);

  return { 
    toast, 
    toasts, 
    dismiss 
  };
}

// Expose toast function directly for convenience
export const toast = (options: ToastOptions) => {
  const { title, description, variant, ...rest } = options;
  
  switch (variant) {
    case "destructive":
      return sonnerToast.error(title || "", {
        description,
        ...rest
      });
    case "success":
      return sonnerToast.success(title || "", {
        description,
        ...rest
      });
    default:
      return sonnerToast(title || "", {
        description,
        ...rest
      });
  }
};
