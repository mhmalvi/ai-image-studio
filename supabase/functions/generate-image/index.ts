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

    // Enhanced style prompts with detailed artistic direction
    const stylePrompts: Record<string, string> = {
      artistic: "Create a stunning artistic masterpiece with bold expressive brushstrokes, vibrant harmonious colors, dynamic composition, and museum-quality fine art aesthetics. Emphasize creative interpretation and emotional depth.",
      photorealistic: "Generate an ultra-photorealistic image with perfect natural lighting, razor-sharp details, professional DSLR quality, 8K resolution, realistic textures, accurate shadows, and lifelike depth of field.",
      anime: "Create in beautiful Japanese anime style with expressive large eyes, dynamic poses, vibrant saturated colors, clean precise linework, cel-shading, and modern anime aesthetics inspired by Studio Ghibli and Makoto Shinkai.",
      cyberpunk: "Design in immersive cyberpunk aesthetic with neon-lit rain-slicked streets, holographic displays, futuristic technology, dark moody atmosphere with vibrant cyan and magenta neon accents, blade runner inspired.",
      "oil-painting": "Create a classical oil painting masterpiece with rich impasto textures, masterful visible brushwork, dramatic chiaroscuro lighting, deep color saturation, and museum-quality Renaissance-inspired finish.",
      vintage: "Apply authentic vintage film photography aesthetic with warm sepia and amber tones, organic film grain, gentle vignette, faded nostalgic colors, and dreamy 1970s Kodachrome feel.",
      watercolor: "Paint in delicate traditional watercolor style with soft organic color bleeds, translucent layered washes, visible paper texture, artistic color diffusion, and impressionistic brushwork.",
      "neon-glow": "Create with vibrant neon glow effects, electric luminous colors, synthwave retro-futuristic aesthetics, dramatic rim lighting, and glowing atmospheric haze.",
      sketch: "Render as a detailed professional pencil sketch with fine crosshatching, artistic graphite shading, hand-drawn linework quality, visible texture, and illustrator-quality craftsmanship.",
      "pop-art": "Design in bold pop art style inspired by Warhol and Lichtenstein with bright primary colors, Ben-Day halftone dots, graphic high-contrast composition, and iconic comic-book aesthetics.",
      noir: "Create in dramatic film noir style with high-contrast black and white, deep mysterious shadows, moody atmospheric lighting, cinematic composition, and classic 1940s detective movie feel.",
      fantasy: "Generate in epic fantasy art style with magical ethereal lighting, mystical atmosphere, enchanted elements, rich detailed environments, and concept art quality inspired by fantasy illustrations.",
    };

    const styleDescription = stylePrompts[style] || stylePrompts.artistic;
    const fullPrompt = `${styleDescription}

Subject: ${prompt}

Technical requirements: Ultra high resolution, professional quality, perfect composition, stunning visual impact. Create a masterpiece.`;

    console.log("Generating image with style:", style, "prompt length:", fullPrompt.length);

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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please try again later." }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const base64Image = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!base64Image) {
      console.error("No image in response:", JSON.stringify(data).substring(0, 300));
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

    const { data: urlData } = supabase.storage
      .from("ai-images")
      .getPublicUrl(fileName);

    console.log("Image generated and uploaded successfully:", urlData.publicUrl);

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
