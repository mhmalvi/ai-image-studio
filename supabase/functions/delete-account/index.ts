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
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Create admin client for deletion operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get the user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting account deletion for user: ${user.id}`);

    // Step 1: Get all user's images to delete from storage
    const { data: images, error: imagesError } = await supabaseUser
      .from("generated_images")
      .select("image_url")
      .eq("user_id", user.id);

    if (imagesError) {
      console.error("Error fetching images:", imagesError);
    }

    // Step 2: Delete images from storage
    if (images && images.length > 0) {
      const filePaths = images
        .map((img: any) => {
          // Extract file path from URL
          const url = img.image_url;
          const match = url.match(/ai-images\/(.+)$/);
          return match ? match[1] : null;
        })
        .filter(Boolean);

      if (filePaths.length > 0) {
        console.log(`Deleting ${filePaths.length} files from storage`);
        const { error: storageError } = await supabaseAdmin.storage
          .from("ai-images")
          .remove(filePaths);

        if (storageError) {
          console.error("Storage deletion error:", storageError);
          // Continue with account deletion even if storage fails
        }
      }
    }

    // Step 3: Delete user's likes
    const { error: likesError } = await supabaseAdmin
      .from("image_likes")
      .delete()
      .eq("user_id", user.id);

    if (likesError) {
      console.error("Likes deletion error:", likesError);
    }

    // Step 4: Delete user's images from database
    const { error: imagesDeleteError } = await supabaseAdmin
      .from("generated_images")
      .delete()
      .eq("user_id", user.id);

    if (imagesDeleteError) {
      console.error("Images deletion error:", imagesDeleteError);
    }

    // Step 5: Delete user's subscription
    const { error: subError } = await supabaseAdmin
      .from("user_subscriptions")
      .delete()
      .eq("user_id", user.id);

    if (subError) {
      console.error("Subscription deletion error:", subError);
    }

    // Step 6: Delete the user account using admin API
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
      console.error("User deletion error:", deleteUserError);
      return new Response(
        JSON.stringify({ error: "Failed to delete user account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Account deleted successfully for user: ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Account and all associated data have been deleted" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Delete account error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Account deletion failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
