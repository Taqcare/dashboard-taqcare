
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
};

export const toast = ({ title, description, variant = "default", duration = 3000 }: ToastProps) => {
  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
      duration,
    });
  }
  
  if (variant === "success") {
    return sonnerToast.success(title, {
      description,
      duration,
    });
  }
  
  // Default case
  return sonnerToast(title, {
    description,
    duration,
  });
};
