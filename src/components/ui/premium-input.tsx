import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  error?: string;
  label?: string;
}

const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ className, type, icon: Icon, error, label, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <motion.div
          className={cn(
            "relative flex items-center rounded-2xl border bg-card/60 backdrop-blur-sm transition-all duration-300",
            isFocused
              ? "border-primary/60 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.4)]"
              : "border-border/50",
            error && "border-destructive/60"
          )}
          animate={isFocused ? { scale: 1.01 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {Icon && (
            <div className="pl-4">
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isFocused ? "text-primary" : "text-muted-foreground"
                )}
              />
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-14 w-full bg-transparent px-4 py-4 text-base font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50",
              Icon && "pl-3",
              className
            )}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
        </motion.div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

PremiumInput.displayName = "PremiumInput";

export { PremiumInput };
