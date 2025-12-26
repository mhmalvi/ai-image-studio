import { forwardRef } from "react";
import { Home, Sparkles, FolderOpen, User, Compass } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/generate", icon: Sparkles, label: "Create" },
  { to: "/explore", icon: Compass, label: "Explore" },
  { to: "/gallery", icon: FolderOpen, label: "Gallery" },
  { to: "/profile", icon: User, label: "Profile" },
];

export const BottomNav = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    const location = useLocation();

    // Hide on auth and splash pages
    if (location.pathname.startsWith("/auth") || location.pathname === "/splash") {
      return null;
    }

    return (
      <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 safe-bottom" {...props}>
        <div className="mx-3 mb-3">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="rounded-3xl border border-border/40 bg-card/80 backdrop-blur-2xl shadow-2xl"
          >
            <div className="flex items-center justify-around py-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="relative flex flex-col items-center px-4 py-2"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -top-1 h-1 w-8 rounded-full gradient-primary"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className={cn(
                        "relative z-10 flex flex-col items-center gap-1 transition-colors duration-200",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      <motion.div
                        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]")} />
                      </motion.div>
                      <span className={cn(
                        "text-[10px] font-medium transition-all",
                        isActive && "font-semibold"
                      )}>
                        {item.label}
                      </span>
                    </motion.div>
                  </NavLink>
                );
              })}
            </div>
          </motion.div>
        </div>
      </nav>
    );
  }
);

BottomNav.displayName = "BottomNav";
