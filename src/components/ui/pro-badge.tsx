import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProBadgeProps {
  variant?: "corner" | "inline";
  size?: "sm" | "md" | "lg";
  className?: string;
  animate?: boolean;
}

export function ProBadge({ 
  variant = "corner", 
  size = "sm",
  className,
  animate = true 
}: ProBadgeProps) {
  const sizeClasses = {
    sm: variant === "corner" ? "h-5 w-5" : "h-4 w-4 gap-0.5 px-1.5 py-0.5",
    md: variant === "corner" ? "h-6 w-6" : "h-5 w-5 gap-1 px-2 py-1",
    lg: variant === "corner" ? "h-7 w-7" : "h-6 w-6 gap-1.5 px-2.5 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  const textSizes = {
    sm: "text-[8px]",
    md: "text-[10px]",
    lg: "text-xs",
  };

  if (variant === "corner") {
    return (
      <motion.div
        initial={animate ? { scale: 0, rotate: -45 } : false}
        animate={animate ? { scale: 1, rotate: 0 } : false}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className={cn(
          "absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full",
          "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500",
          "shadow-lg shadow-amber-500/30",
          sizeClasses[size],
          className
        )}
      >
        <Crown className={cn(iconSizes[size], "text-white drop-shadow-sm")} />
        {animate && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300/50 to-transparent"
            animate={{ opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={animate ? { scale: 0 } : false}
      animate={animate ? { scale: 1 } : false}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={cn(
        "inline-flex items-center rounded-full",
        "bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500",
        "shadow-sm shadow-amber-500/20",
        sizeClasses[size],
        className
      )}
    >
      <Crown className={cn(iconSizes[size], "text-white")} />
      <span className={cn(textSizes[size], "font-bold text-white")}>PRO</span>
    </motion.div>
  );
}
