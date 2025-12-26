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
    const { imageUrl, filter, intensity = 70 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("API key not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Calculate intensity description for more nuanced control
    const getIntensityDescription = (level: number): string => {
      if (level <= 25) return "very subtle and gentle, barely noticeable";
      if (level <= 50) return "moderate and balanced, clearly visible but natural";
      if (level <= 75) return "strong and pronounced, dramatically visible";
      return "maximum intensity, fully transformed with bold effect";
    };

    const intensityDesc = getIntensityDescription(intensity);

    // Enhanced intelligent filter prompts with detailed artistic direction
    const filterPrompts: Record<string, string> = {
      "oil-painting": `Transform this image into a ${intensityDesc} classical oil painting. Apply rich impasto textures with visible dimensional brushstrokes, masterful color blending, dramatic chiaroscuro lighting, and museum-quality Renaissance painting aesthetics. Maintain the original subject while adding painterly artistic interpretation.`,
      
      "cyberpunk": `Apply a ${intensityDesc} cyberpunk transformation. Add neon lighting effects in cyan and magenta, futuristic holographic overlays, rain-slicked reflective surfaces, dystopian atmosphere, and blade-runner inspired color grading while preserving the subject's identity.`,
      
      "vintage": `Apply ${intensityDesc} authentic vintage film photography processing. Add warm sepia and amber color tones, organic film grain texture, gentle corner vignette, faded nostalgic color palette, and dreamy 1970s Kodachrome aesthetic while maintaining subject clarity.`,
      
      "anime": `Transform into ${intensityDesc} Japanese anime/manga art style. Add clean precise linework, cel-shading with distinct shadows, vibrant saturated anime colors, expressive stylized features, and modern anime aesthetics while keeping the subject recognizable.`,
      
      "watercolor": `Apply ${intensityDesc} traditional watercolor painting effect. Add soft organic color bleeds, translucent layered washes, visible textured paper grain, artistic color diffusion, and impressionistic brushwork while maintaining subject composition.`,
      
      "neon-glow": `Add ${intensityDesc} vibrant neon glow effects. Apply electric luminous rim lighting, synthwave color palette, glowing atmospheric haze, retro-futuristic aesthetics, and dramatic neon accents while preserving subject details.`,
      
      "sketch": `Transform into a ${intensityDesc} professional pencil sketch. Add detailed crosshatching, artistic graphite shading, hand-drawn linework quality, visible paper texture, and illustrator-quality craftsmanship while maintaining subject likeness.`,
      
      "pop-art": `Apply ${intensityDesc} bold pop art style transformation. Add bright primary colors, Ben-Day halftone dot patterns, high-contrast graphic composition, Warhol-inspired color blocking, and comic-book aesthetics while keeping subject recognizable.`,
      
      "portrait-enhance": `Apply ${intensityDesc} professional portrait enhancement. Intelligently smooth skin while keeping natural texture, enhance eye clarity and brightness, optimize facial lighting, add subtle glamour glow, and create magazine-quality portrait results.`,
      
      "hdr": `Apply ${intensityDesc} HDR enhancement processing. Dramatically boost dynamic range, reveal hidden details in shadows and highlights, intensify color vibrancy, add dramatic contrast, and create stunning high-impact visual results.`,
      
      "cinematic": `Apply ${intensityDesc} cinematic color grading. Add Hollywood film-like color processing, anamorphic lens feel, dramatic atmospheric lighting, movie poster quality composition, and professional cinema aesthetics.`,
      
      "fantasy": `Transform with ${intensityDesc} magical fantasy effects. Add ethereal glowing lighting, mystical particle effects, enchanted color atmosphere, fairytale magical elements, and epic fantasy illustration quality while maintaining subject.`,
    };

    const filterPrompt = filterPrompts[filter] || filterPrompts["oil-painting"];

    console.log("Applying filter:", filter, "intensity:", intensity, "prompt length:", filterPrompt.length);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: filterPrompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        }],
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
      console.error("No image in response");
      throw new Error("No image returned from AI");
    }

    // Extract base64 data and upload to storage
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const fileName = `filtered/${Date.now()}-${crypto.randomUUID()}.png`;

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

    console.log("Filtered image uploaded:", urlData.publicUrl);

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
