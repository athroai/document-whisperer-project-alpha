
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
    <div className={cn("flex items-center justify-center", className)}>
      <Loader 
        className="animate-spin" 
        size={size} 
        color={color} 
      />
    </div>
  );
};

export default LoadingSpinner;
