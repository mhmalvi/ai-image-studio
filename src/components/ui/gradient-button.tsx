import { forwardRef, ButtonHTMLAttributes } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface GradientButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "gradient-primary glow-primary",
      secondary: "gradient-secondary glow-secondary",
      accent: "gradient-accent glow-accent",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm rounded-lg",
      md: "h-12 px-6 text-base rounded-xl",
      lg: "h-14 px-8 text-lg rounded-2xl",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative font-semibold text-primary-foreground transition-all duration-300",
          "disabled:opacity-50 disabled:pointer-events-none",
          "flex items-center justify-center gap-2",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);

GradientButton.displayName = "GradientButton";
