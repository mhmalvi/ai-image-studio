import { useState } from "react";
import { motion } from "framer-motion";
import { User, LogIn, LogOut, Settings, Crown, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { GradientButton } from "@/components/ui/gradient-button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Profile() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "Welcome to AI Image Studio",
        });
        setIsLoggedIn(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Welcome back!",
          description: "You're now signed in",
        });
        setIsLoggedIn(true);
      }
      setShowAuth(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    toast({
      title: "Signed out",
      description: "See you next time!",
    });
  };

  const menuItems = [
    { icon: Crown, label: "Upgrade to Pro", color: "text-highlight" },
    { icon: Settings, label: "Settings", color: "text-muted-foreground" },
  ];

  return (
    <PageLayout>
      <div className="flex min-h-screen flex-col px-4 pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground">
            {isLoggedIn ? "Manage your account" : "Sign in to sync your creations"}
          </p>
        </motion.div>

        {!showAuth ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-1 flex-col"
          >
            {/* Profile Card */}
            <div className="mb-6 rounded-2xl border border-border/50 bg-card p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  {isLoggedIn ? (
                    <>
                      <h3 className="text-lg font-semibold text-foreground">
                        Welcome!
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {email || "user@email.com"}
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-foreground">
                        Guest User
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Sign in to sync your work
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-6 grid grid-cols-3 gap-3">
              {[
                { label: "Created", value: "12" },
                { label: "Filtered", value: "8" },
                { label: "Saved", value: "20" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border/50 bg-card p-3 text-center"
                >
                  <p className="text-2xl font-bold text-gradient-primary">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Menu Items */}
            <div className="mb-6 space-y-2">
              {menuItems.map((item) => (
                <motion.button
                  key={item.label}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center gap-4 rounded-xl border border-border/50 bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <span className="flex-1 text-left font-medium text-foreground">
                    {item.label}
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </motion.button>
              ))}
            </div>

            {/* Auth Button */}
            <div className="mt-auto">
              {isLoggedIn ? (
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
                <GradientButton
                  onClick={() => setShowAuth(true)}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  <LogIn className="h-5 w-5" />
                  Sign In
                </GradientButton>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-1 flex-col"
          >
            <form onSubmit={handleAuth} className="flex flex-1 flex-col">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="rounded-xl border-border/50 bg-card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="rounded-xl border-border/50 bg-card"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <GradientButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                >
                  {isSignUp ? "Create Account" : "Sign In"}
                </GradientButton>

                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowAuth(false)}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
}
