import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-16 w-16",
    lg: "h-24 w-24",
  };

  return (
    <div className={cn("relative", sizes[size], className)}>
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-primary/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-2 rounded-full border-4 border-transparent border-t-accent"
        animate={{ rotate: -360 }}
        transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export function GeneratingAnimation({ message = "Creating magic..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      <LoadingSpinner size="lg" />
      <motion.p
        className="text-lg font-medium text-muted-foreground"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {message}
      </motion.p>
    </div>
  );
}
