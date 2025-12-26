import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PremiumInput } from "@/components/ui/premium-input";
import { GradientButton } from "@/components/ui/gradient-button";
import { GlassCard } from "@/components/ui/glass-card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validation = emailSchema.safeParse({ email });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      });
      if (error) throw error;
      
      setIsSuccess(true);
      toast({
        title: "Email sent!",
        description: "Check your inbox for the reset link",
      });
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

  if (isSuccess) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent you a password reset link">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <GlassCard variant="elevated" glow="primary" className="mb-6 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20"
            >
              <CheckCircle className="h-8 w-8 text-primary" />
            </motion.div>
            <p className="text-muted-foreground">
              If an account exists for <span className="font-medium text-foreground">{email}</span>, you'll receive a password reset email shortly.
            </p>
          </GlassCard>

          <Link to="/auth/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset password" subtitle="Enter your email to receive a reset link">
      <form onSubmit={handleSubmit} className="space-y-6">
        <GlassCard variant="subtle" hover={false} className="space-y-5 p-6">
          <PremiumInput
            type="email"
            icon={Mail}
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />
        </GlassCard>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <GradientButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Send Reset Link
            <ArrowRight className="ml-2 h-5 w-5" />
          </GradientButton>

          <Link
            to="/auth/login"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </motion.div>
      </form>
    </AuthLayout>
  );
}
