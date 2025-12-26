import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  value: number;
  label: string;
  icon?: LucideIcon;
  gradient?: "primary" | "accent" | "secondary";
  className?: string;
}

export function StatCard({
  value,
  label,
  icon: Icon,
  gradient = "primary",
  className,
}: StatCardProps) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  const gradientClasses = {
    primary: "from-primary/20 to-primary/5 text-primary",
    accent: "from-accent/20 to-accent/5 text-accent",
    secondary: "from-secondary/20 to-secondary/5 text-secondary",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/30 bg-card/60 p-4 backdrop-blur-sm",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50",
          gradientClasses[gradient]
        )}
      />
      <div className="relative z-10 flex flex-col items-center gap-1">
        {Icon && (
          <Icon
            className={cn("h-5 w-5 opacity-60", gradientClasses[gradient].split(" ").pop())}
          />
        )}
        <motion.span className="text-3xl font-bold text-foreground">
          {display}
        </motion.span>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
    </motion.div>
  );
}
