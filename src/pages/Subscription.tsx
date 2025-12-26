import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Check, ArrowLeft, Sparkles, Zap, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { GradientButton } from "@/components/ui/gradient-button";
import { GlassCard } from "@/components/ui/glass-card";
import { useSubscription, SUBSCRIPTION_PLANS, SubscriptionPlan } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useHaptics } from "@/hooks/useHaptics";
import { useToast } from "@/hooks/use-toast";
import { headerVariants, containerVariants, itemVariants, buttonTapAnimation } from "@/lib/animations";

export default function Subscription() {
  const { subscription, currentPlan, isLoading } = useSubscription();
  const { isAuthenticated } = useAuth();
  const { mediumImpact, successNotification } = useHaptics();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectPlan = (planId: SubscriptionPlan) => {
    mediumImpact();
    setSelectedPlan(planId);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || selectedPlan === "free") return;

    mediumImpact();
    setIsProcessing(true);

    // Simulate processing - in production, this would integrate with Google Play Billing
    setTimeout(() => {
      setIsProcessing(false);
      successNotification();
      toast({
        title: "Coming Soon!",
        description: "Google Play billing integration is under development. Check back soon!",
      });
    }, 1500);
  };

  const getPlanIcon = (planId: SubscriptionPlan) => {
    switch (planId) {
      case "premium":
        return Crown;
      case "pro":
        return Zap;
      default:
        return Star;
    }
  };

  if (isLoading) {
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
    <PageLayout>
      <PageTransition className="flex flex-col h-full px-4 pt-4 pb-4">
        {/* Header */}
        <motion.div
          variants={headerVariants}
          initial="initial"
          animate="animate"
          className="mb-4 flex items-center gap-3"
        >
          <Link to="/profile">
            <motion.button
              whileTap={buttonTapAnimation}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted"
            >
              <ArrowLeft className="h-4 w-4 text-foreground" />
            </motion.button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              <span className="text-gradient-primary">Upgrade</span> Plan
            </h1>
            <p className="text-xs text-muted-foreground">
              Unlock premium features
            </p>
          </div>
        </motion.div>

        {/* Current Plan Badge */}
        {isAuthenticated && (
          <motion.div
            variants={itemVariants}
            initial="initial"
            animate="animate"
            className="mb-4"
          >
            <GlassCard variant="subtle" className="flex items-center gap-3 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Plan</p>
                <p className="text-sm font-bold text-foreground capitalize">
                  {currentPlan}
                </p>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Plan Cards */}
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="flex-1 space-y-3 overflow-y-auto scrollbar-hide pb-4"
        >
          {SUBSCRIPTION_PLANS.map((plan) => {
            const Icon = getPlanIcon(plan.id);
            const isCurrentPlan = currentPlan === plan.id;
            const isSelected = selectedPlan === plan.id;

            return (
              <motion.div key={plan.id} variants={itemVariants}>
                <GlassCard
                  variant={isSelected ? "elevated" : "default"}
                  glow={plan.popular ? "primary" : "none"}
                  className={`relative cursor-pointer transition-all ${
                    isSelected ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 left-4 px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-primary to-accent text-white rounded-full">
                      POPULAR
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-2 right-4 px-2 py-0.5 text-[10px] font-bold bg-success text-white rounded-full">
                      CURRENT
                    </div>
                  )}

                  <div className="flex items-start gap-3 pt-1">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      plan.id === "premium" 
                        ? "bg-gradient-to-br from-amber-500 to-orange-500" 
                        : plan.id === "pro"
                        ? "gradient-primary"
                        : "bg-muted"
                    }`}>
                      <Icon className={`h-5 w-5 ${plan.id === "free" ? "text-muted-foreground" : "text-white"}`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
                        <span className={`text-lg font-bold ${
                          plan.id === "free" ? "text-muted-foreground" : "text-gradient-primary"
                        }`}>
                          {plan.price}
                        </span>
                      </div>

                      <ul className="space-y-1.5">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Check className={`h-3 w-3 ${
                              plan.id === "free" ? "text-muted-foreground" : "text-success"
                            }`} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Selection indicator */}
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      isSelected 
                        ? "border-primary bg-primary" 
                        : "border-muted-foreground"
                    }`}>
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Subscribe Button */}
        <motion.div
          variants={itemVariants}
          initial="initial"
          animate="animate"
          className="flex-shrink-0 pt-2"
        >
          {!isAuthenticated ? (
            <Link to="/auth/login">
              <GradientButton variant="primary" size="lg" className="w-full">
                Sign in to Subscribe
              </GradientButton>
            </Link>
          ) : selectedPlan && selectedPlan !== "free" && selectedPlan !== currentPlan ? (
            <GradientButton
              variant="primary"
              size="lg"
              className="w-full btn-shine"
              onClick={handleSubscribe}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <motion.div
                  className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <>
                  <Crown className="h-5 w-5" />
                  Upgrade to {SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.name}
                </>
              )}
            </GradientButton>
          ) : (
            <GradientButton variant="secondary" size="lg" className="w-full" disabled>
              {currentPlan === "premium" ? "You have the best plan!" : "Select a plan to upgrade"}
            </GradientButton>
          )}

          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Subscriptions are managed through Google Play Store. Cancel anytime.
          </p>
        </motion.div>
      </PageTransition>
    </PageLayout>
  );
}
