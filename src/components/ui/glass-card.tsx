import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "elevated" | "subtle";
  glow?: "primary" | "accent" | "secondary" | "none";
  hover?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", glow = "none", hover = true, children, ...props }, ref) => {
    const variants = {
      default: "bg-card/60 backdrop-blur-xl border-border/30",
      elevated: "bg-card/80 backdrop-blur-2xl border-border/40 shadow-2xl",
      subtle: "bg-card/40 backdrop-blur-lg border-border/20",
    };

    const glowStyles = {
      primary: "shadow-[0_0_60px_-15px_hsl(var(--primary)/0.5)]",
      accent: "shadow-[0_0_60px_-15px_hsl(var(--accent)/0.5)]",
      secondary: "shadow-[0_0_60px_-15px_hsl(var(--secondary)/0.5)]",
      none: "",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-3xl border p-6 transition-all duration-300",
          variants[variant],
          glowStyles[glow],
          hover && "hover:border-primary/40 hover:shadow-lg",
          className
        )}
        whileHover={hover ? { y: -2, scale: 1.01 } : undefined}
        whileTap={hover ? { scale: 0.99 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";
