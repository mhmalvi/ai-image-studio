import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, LogOut, Settings, Crown, ChevronRight, ImageIcon, Wand2, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { GradientButton } from "@/components/ui/gradient-button";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "@/components/ui/stat-card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function Profile() {
  const { user, isLoading: authLoading, signOut, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({ generated: 0, filtered: 0, total: 0 });
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("generated_images")
      .select("type")
      .eq("user_id", user.id);

    if (!error && data) {
      const generated = data.filter((i) => i.type === "generated").length;
      const filtered = data.filter((i) => i.type === "filtered").length;
      setStats({ generated, filtered, total: data.length });
    }
  };

  const handleLogout = async () => {
    await signOut();
    setStats({ generated: 0, filtered: 0, total: 0 });
    toast({
      title: "Signed out",
      description: "See you next time!",
    });
  };

  const menuItems = [
    { icon: Crown, label: "Upgrade to Pro", color: "text-highlight", href: "#" },
    { icon: Settings, label: "Settings", color: "text-muted-foreground", href: "#" },
  ];

  if (authLoading) {
    return (
      <PageLayout>
        <div className="flex min-h-screen items-center justify-center">
          <motion.div
            className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout background="mesh">
      <div className="flex min-h-screen flex-col px-5 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-sm text-muted-foreground">
              {isAuthenticated ? "Manage your account" : "Sign in to sync your creations"}
            </p>
          </div>
          <ThemeToggle />
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard variant="elevated" glow={isAuthenticated ? "primary" : "none"} className="mb-6">
            <div className="flex items-center gap-5">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl gradient-primary shadow-lg">
                  <User className="h-10 w-10 text-primary-foreground" />
                </div>
                {isAuthenticated && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success border-2 border-card"
                  />
                )}
              </motion.div>
              <div className="flex-1">
                {isAuthenticated ? (
                  <>
                    <h3 className="text-xl font-bold text-foreground">
                      Welcome back!
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-foreground">
                      Guest User
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Sign in to sync your work
                    </p>
                  </>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 grid grid-cols-3 gap-3"
        >
          <StatCard value={stats.generated} label="Generated" icon={Wand2} gradient="primary" />
          <StatCard value={stats.filtered} label="Filtered" icon={ImageIcon} gradient="accent" />
          <StatCard value={stats.total} label="Total" icon={ImageIcon} gradient="secondary" />
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 space-y-3"
        >
          {menuItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + index * 0.1 }}
            >
              <GlassCard
                variant="subtle"
                className="flex items-center gap-4 p-4 cursor-pointer"
              >
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  item.label === "Upgrade to Pro" ? "bg-highlight/20" : "bg-muted"
                )}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <span className="flex-1 font-semibold text-foreground">
                  {item.label}
                </span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Auth Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-auto pb-6"
        >
          {isAuthenticated ? (
            <GradientButton
              onClick={handleLogout}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </GradientButton>
          ) : (
            <Link to="/auth/login">
              <GradientButton
                variant="primary"
                size="lg"
                className="w-full btn-shine"
              >
                <LogIn className="h-5 w-5" />
                Sign In
              </GradientButton>
            </Link>
          )}
        </motion.div>
      </div>
    </PageLayout>
  );
}

