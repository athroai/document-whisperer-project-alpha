
import React from "react";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  size = 24,
  color = "currentColor",
}) => {
  return (
    <Loader 
      className={cn("animate-spin", className)} 
      size={size} 
      color={color} 
    />
  );
};

export default LoadingSpinner;
