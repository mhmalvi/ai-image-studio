import { Home, Sparkles, ImageIcon, FolderOpen, User, Compass } from "lucide-react";
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

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="mx-2 mb-2 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="relative flex flex-col items-center px-3 py-2"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl gradient-primary opacity-20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "relative z-10 flex flex-col items-center gap-1",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </motion.div>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
