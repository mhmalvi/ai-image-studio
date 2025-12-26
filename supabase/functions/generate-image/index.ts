import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, style } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("API key not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const stylePrompts: Record<string, string> = {
      artistic: "artistic, painterly style, vibrant colors",
      photorealistic: "photorealistic, ultra detailed, 8k quality",
      anime: "anime style, Studio Ghibli inspired, detailed",
      cyberpunk: "cyberpunk aesthetic, neon lights, futuristic",
      "oil-painting": "oil painting with rich textures and brushstrokes",
      vintage: "vintage film photography look with warm tones and grain",
      watercolor: "delicate watercolor painting with soft edges",
      "neon-glow": "vibrant neon glow effects and dramatic lighting",
      sketch: "detailed pencil sketch with fine lines and shading",
      "pop-art": "pop art style with bold colors like Andy Warhol",
      "pixel-art": "retro pixel art style with visible pixels",
      dreamy: "soft dreamy ethereal look with gentle blur and light leaks",
      noir: "dramatic black and white film noir style with high contrast",
      fantasy: "magical fantasy style with mystical lighting",
    };

    const fullPrompt = `${prompt}, ${stylePrompts[style] || stylePrompts.artistic}`;

    console.log("Generating image with prompt:", fullPrompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [{ role: "user", content: fullPrompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status, await response.text());
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const base64Image = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!base64Image) {
      throw new Error("No image returned from AI");
    }

    // Extract base64 data and upload to storage
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const fileName = `generated/${Date.now()}-${crypto.randomUUID()}.png`;

    const { error: uploadError } = await supabase.storage
      .from("ai-images")
      .upload(fileName, imageBuffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Failed to save image");
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("ai-images")
      .getPublicUrl(fileName);

    console.log("Image uploaded successfully:", urlData.publicUrl);

    return new Response(JSON.stringify({ imageUrl: urlData.publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
