import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's auth token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Exporting data for user: ${user.id}`);

    // Fetch user's generated images
    const { data: images, error: imagesError } = await supabase
      .from("generated_images")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (imagesError) {
      console.error("Error fetching images:", imagesError);
      throw imagesError;
    }

    // Fetch user's likes
    const { data: likes, error: likesError } = await supabase
      .from("image_likes")
      .select("*")
      .eq("user_id", user.id);

    if (likesError) {
      console.error("Error fetching likes:", likesError);
      throw likesError;
    }

    // Fetch user's subscription
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subError) {
      console.error("Error fetching subscription:", subError);
      throw subError;
    }

    // Compile the export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      },
      generatedImages: images || [],
      likes: likes || [],
      subscription: subscription || null,
      statistics: {
        totalImages: images?.length || 0,
        totalLikes: likes?.length || 0,
        publicImages: images?.filter((img: any) => img.is_public).length || 0,
        privateImages: images?.filter((img: any) => !img.is_public).length || 0,
      },
    };

    console.log(`Export completed: ${exportData.statistics.totalImages} images, ${exportData.statistics.totalLikes} likes`);

    return new Response(
      JSON.stringify(exportData, null, 2),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="user-data-export-${Date.now()}.json"`,
        } 
      }
    );
  } catch (error: any) {
    console.error("Export error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Export failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
