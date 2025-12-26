import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Check } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PremiumInput } from "@/components/ui/premium-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { GlassCard } from "@/components/ui/glass-card";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { containerVariants, itemVariants } from "@/lib/animations";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const features = [
  "Generate stunning AI images",
  "Apply creative filters",
  "Save to your personal gallery",
  "Share with the community",
];

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = signupSchema.safeParse({ email, password });
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
      const { error } = await signUp(email, password);
      if (error) {
        if (error.message?.includes("User already registered")) {
          throw new Error("This email is already registered. Try signing in.");
        }
        throw error;
      }
      
      toast({
        title: "Account created!",
        description: "Welcome to AI Image Studio",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Start your creative journey">
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-6"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {/* Features list */}
        <motion.div variants={itemVariants} className="mb-6 grid grid-cols-2 gap-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature}
              variants={itemVariants}
              className="flex items-center gap-2"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                <Check className="h-3 w-3 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">{feature}</span>
            </motion.div>
          ))}
        </motion.div>

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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
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
            Create Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </GradientButton>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-center text-sm text-muted-foreground"
        >
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="font-medium text-primary transition-colors hover:text-primary/80"
          >
            Sign in
          </Link>
        </motion.p>
      </motion.form>
    </AuthLayout>
  );
}
