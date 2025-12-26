import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedBackgroundProps {
  variant?: "default" | "mesh" | "particles" | "aurora";
  className?: string;
}

export function AnimatedBackground({ variant = "default", className }: AnimatedBackgroundProps) {
  if (variant === "mesh") {
    return (
      <div className={cn("fixed inset-0 -z-10 overflow-hidden", className)}>
        <div className="absolute inset-0 bg-background" />
        <motion.div
          className="absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -right-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[100px]"
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 h-[600px] w-[600px] rounded-full bg-secondary/15 blur-[140px]"
          animate={{
            x: [0, 50, 0],
            y: [0, -80, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (variant === "aurora") {
    return (
      <div className={cn("fixed inset-0 -z-10 overflow-hidden", className)}>
        <div className="absolute inset-0 bg-background" />
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: "linear-gradient(180deg, transparent 0%, hsl(var(--primary)/0.1) 50%, transparent 100%)",
          }}
          animate={{
            y: ["-100%", "100%"],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: "linear-gradient(180deg, transparent 0%, hsl(var(--accent)/0.15) 50%, transparent 100%)",
          }}
          animate={{
            y: ["100%", "-100%"],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    );
  }

  if (variant === "particles") {
    const particles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 15,
    }));

    return (
      <div className={cn("fixed inset-0 -z-10 overflow-hidden", className)}>
        <div className="absolute inset-0 bg-background" />
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-primary/30"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    );
  }

  // Default gradient
  return (
    <div className={cn("fixed inset-0 -z-10", className)}>
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
    </div>
  );
}
