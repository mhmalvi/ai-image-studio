import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, LogOut, Settings, Crown, ChevronRight, ImageIcon, Wand2, LogIn, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { GradientButton } from "@/components/ui/gradient-button";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "@/components/ui/stat-card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";
import { headerVariants, containerVariants, itemVariants, buttonTapAnimation } from "@/lib/animations";

export default function Profile() {
  const { user, isLoading: authLoading, signOut, isAuthenticated } = useAuth();
  const { currentPlan, isPro } = useSubscription();
  const { lightImpact, mediumImpact } = useHaptics();
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
    mediumImpact();
    await signOut();
    setStats({ generated: 0, filtered: 0, total: 0 });
    toast({
      title: "Signed out",
      description: "See you next time!",
    });
  };

  const menuItems = [
    { 
      icon: Crown, 
      label: isPro ? "Manage Subscription" : "Upgrade to Pro", 
      color: "text-highlight", 
      href: "/subscription",
      badge: isPro ? currentPlan.toUpperCase() : null,
    },
    { icon: Settings, label: "Settings", color: "text-muted-foreground", href: "/settings" },
  ];

  if (authLoading) {
    return (
      <PageLayout>
        <div className="flex h-full items-center justify-center">
          <motion.div
            className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout background="mesh">
      <PageTransition className="flex flex-col h-full px-4 pt-6">
        {/* Header */}
        <motion.div
          variants={headerVariants}
          initial="initial"
          animate="animate"
          className="mb-5 flex items-center justify-between flex-shrink-0"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Profile</h1>
            <p className="text-xs text-muted-foreground">
              {isAuthenticated ? "Manage your account" : "Sign in to sync your creations"}
            </p>
          </div>
          <ThemeToggle />
        </motion.div>

        {/* Profile Card */}
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={itemVariants} className="flex-shrink-0">
            {isAuthenticated ? (
              <GlassCard variant="elevated" glow="primary" className="mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg">
                      <User className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-success border-2 border-card"
                    />
                    {isPro && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                      >
                        <Sparkles className="h-3 w-3 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-foreground">
                        Welcome back!
                      </h3>
                      {isPro && (
                        <span className="px-1.5 py-0.5 text-[8px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full uppercase">
                          {currentPlan}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </GlassCard>
            ) : (
              <Link to="/auth/login">
                <motion.div whileTap={buttonTapAnimation} onClick={() => lightImpact()}>
                  <GlassCard variant="elevated" glow="accent" className="mb-4 cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-accent shadow-lg group-hover:scale-105 transition-transform">
                          <User className="h-7 w-7 text-accent-foreground" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-foreground">
                          Guest User
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Tap to sign in and sync your work
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-accent group-hover:translate-x-1 transition-transform" />
                    </div>
                  </GlassCard>
                </motion.div>
              </Link>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="mb-4 grid grid-cols-3 gap-2 flex-shrink-0">
            <StatCard value={stats.generated} label="Generated" icon={Wand2} gradient="primary" />
            <StatCard value={stats.filtered} label="Filtered" icon={ImageIcon} gradient="accent" />
            <StatCard value={stats.total} label="Total" icon={ImageIcon} gradient="secondary" />
          </motion.div>

          {/* Menu Items */}
          <div className="mb-4 space-y-2 flex-shrink-0">
            {menuItems.map((item) => (
              <motion.div key={item.label} variants={itemVariants}>
                <Link to={item.href}>
                  <motion.div whileTap={buttonTapAnimation} onClick={() => lightImpact()}>
                    <GlassCard
                      variant="subtle"
                      className="flex items-center gap-3 p-3 cursor-pointer"
                    >
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        item.label.includes("Pro") || item.label.includes("Subscription") 
                          ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20" 
                          : "bg-muted"
                      )}>
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                      </div>
                      <span className="flex-1 text-sm font-semibold text-foreground">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[8px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </GlassCard>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Auth Button */}
        <motion.div
          variants={itemVariants}
          initial="initial"
          animate="animate"
          className="mt-auto pb-4 flex-shrink-0"
        >
          {isAuthenticated ? (
            <GradientButton
              onClick={handleLogout}
              variant="secondary"
              size="md"
              className="w-full"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </GradientButton>
          ) : (
            <Link to="/auth/login">
              <GradientButton
                variant="primary"
                size="md"
                className="w-full btn-shine"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </GradientButton>
            </Link>
          )}
        </motion.div>
      </PageTransition>
    </PageLayout>
  );
}
