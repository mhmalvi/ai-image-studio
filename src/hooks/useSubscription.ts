import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type SubscriptionPlan = "free" | "pro" | "premium";
export type SubscriptionStatus = "active" | "canceled" | "expired" | "pending";

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  provider: string | null;
  provider_subscription_id: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlanDetails {
  id: SubscriptionPlan;
  name: string;
  price: string;
  priceMonthly: number;
  features: string[];
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlanDetails[] = [
  {
    id: "free",
    name: "Free",
    price: "Free",
    priceMonthly: 0,
    features: [
      "5 image generations/day",
      "8 basic filters",
      "Standard quality",
      "Community access",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$4.99/mo",
    priceMonthly: 4.99,
    popular: true,
    features: [
      "Unlimited generations",
      "12+ premium filters",
      "HD quality exports",
      "Priority processing",
      "No watermarks",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$9.99/mo",
    priceMonthly: 9.99,
    features: [
      "Everything in Pro",
      "4K quality exports",
      "Exclusive styles",
      "Early access features",
      "Priority support",
    ],
  },
];

export const useSubscription = () => {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSubscription(data as Subscription);
      } else {
        // Create free subscription for new users
        const { data: newSub, error: insertError } = await supabase
          .from("user_subscriptions")
          .insert({
            user_id: user.id,
            plan: "free",
            status: "active",
          })
          .select()
          .single();

        if (!insertError && newSub) {
          setSubscription(newSub as Subscription);
        }
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchSubscription]);

  const isPro = subscription?.plan === "pro" || subscription?.plan === "premium";
  const isPremium = subscription?.plan === "premium";
  const isExpired = subscription?.status === "expired" || 
    (subscription?.expires_at && new Date(subscription.expires_at) < new Date());

  const canAccessFeature = (requiredPlan: SubscriptionPlan): boolean => {
    if (!subscription || isExpired) return requiredPlan === "free";
    
    const planHierarchy: Record<SubscriptionPlan, number> = {
      free: 0,
      pro: 1,
      premium: 2,
    };

    return planHierarchy[subscription.plan] >= planHierarchy[requiredPlan];
  };

  const refreshSubscription = () => {
    fetchSubscription();
  };

  return {
    subscription,
    isLoading,
    isPro,
    isPremium,
    isExpired,
    canAccessFeature,
    refreshSubscription,
    currentPlan: subscription?.plan || "free",
  };
};
