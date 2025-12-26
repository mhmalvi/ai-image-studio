import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyPurchaseRequest {
  userId: string;
  productId: string;
  plan: "pro" | "premium";
  expiresAt: string | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, productId, plan, expiresAt }: VerifyPurchaseRequest = await req.json();

    console.log(`Verifying purchase for user ${userId}: ${productId} (${plan})`);

    if (!userId || !productId || !plan) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user subscription exists
    const { data: existingSub, error: fetchError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching subscription:", fetchError);
      throw fetchError;
    }

    const subscriptionData = {
      user_id: userId,
      plan,
      status: "active",
      provider: "google_play",
      provider_subscription_id: productId,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    };

    if (existingSub) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from("user_subscriptions")
        .update(subscriptionData)
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating subscription:", updateError);
        throw updateError;
      }

      console.log(`Updated subscription for user ${userId} to ${plan}`);
    } else {
      // Create new subscription
      const { error: insertError } = await supabase
        .from("user_subscriptions")
        .insert({
          ...subscriptionData,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error creating subscription:", insertError);
        throw insertError;
      }

      console.log(`Created subscription for user ${userId}: ${plan}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Subscription ${existingSub ? "updated" : "created"} successfully`,
        plan,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Verify purchase error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to verify purchase";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
