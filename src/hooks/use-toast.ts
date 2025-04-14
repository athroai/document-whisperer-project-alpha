
// Import from sonner
import { toast as sonnerToast } from "sonner";

// Define types for toast options to match existing usage
type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
  action?: React.ReactNode;
};

// Create a compatibility wrapper around sonner's toast
export const toast = (options: ToastOptions) => {
  const { title, description, variant, ...rest } = options;
  
  // Convert our options format to sonner's format
  const message = title || "";
  const details = description;
  
  switch (variant) {
    case "destructive":
      return sonnerToast.error(message, {
        description: details,
        ...rest
      });
    case "success":
      return sonnerToast.success(message, {
        description: details,
        ...rest
      });
    default:
      return sonnerToast(message, {
        description: details,
        ...rest
      });
  }
};

// Hook for components that need to use toast
export function useToast() {
  return {
    toast,
  };
}

