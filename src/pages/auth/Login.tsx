import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PremiumInput } from "@/components/ui/premium-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { GlassCard } from "@/components/ui/glass-card";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { containerVariants, itemVariants } from "@/lib/animations";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You're now signed in",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue creating">
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-6"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={itemVariants}>
          <SocialLoginButtons />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <GlassCard variant="subtle" hover={false} className="space-y-5 p-6">
            <PremiumInput
              type="email"
              icon={Mail}
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
            <PremiumInput
              type="password"
              icon={Lock}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />

            <div className="flex justify-end">
              <Link
                to="/auth/forgot"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Forgot password?
              </Link>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <GradientButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Sign In
            <ArrowRight className="ml-2 h-5 w-5" />
          </GradientButton>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-center text-sm text-muted-foreground"
        >
          Don't have an account?{" "}
          <Link
            to="/auth/signup"
            className="font-medium text-primary transition-colors hover:text-primary/80"
          >
            Create one
          </Link>
        </motion.p>
      </motion.form>
    </AuthLayout>
  );
}
