import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, Download, Share2, RotateCcw, Globe, Lock } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { GradientButton } from "@/components/ui/gradient-button";
import { GeneratingAnimation } from "@/components/ui/loading-spinner";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const stylePresets = [
  { id: "artistic", label: "Artistic", color: "primary" },
  { id: "photorealistic", label: "Photorealistic", color: "secondary" },
  { id: "anime", label: "Anime", color: "accent" },
  { id: "cyberpunk", label: "Cyberpunk", color: "highlight" },
];

export default function Generate() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("artistic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe the image you want to create",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt, style: selectedStyle },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        
        // Save to database if authenticated
        if (isAuthenticated && user) {
          await saveToDatabase(data.imageUrl);
        }

        toast({
          title: "Image created!",
          description: isAuthenticated ? "Saved to your gallery" : "Sign in to save your creations",
        });
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToDatabase = async (imageUrl: string) => {
    if (!user) return;

    await supabase.from("generated_images").insert({
      user_id: user.id,
      image_url: imageUrl,
      prompt: prompt,
      style: selectedStyle,
      type: "generated",
      is_public: isPublic,
    });
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `ai-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded!",
      description: "Image saved to your device",
    });
  };

  const handleShare = async () => {
    if (!generatedImage) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI Generated Image",
          text: prompt,
          url: generatedImage,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(generatedImage);
      toast({
        title: "Link copied!",
        description: "Image URL copied to clipboard",
      });
    }
  };

  const handleReset = () => {
    setGeneratedImage(null);
    setPrompt("");
    setIsPublic(false);
  };

  return (
    <PageLayout>
      <div className="flex min-h-screen flex-col px-4 pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-foreground">
            Generate <span className="text-gradient-primary">Image</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Describe your vision and let AI create it
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!generatedImage && !isGenerating && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col"
            >
              {/* Prompt Input */}
              <div className="mb-4">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A serene mountain landscape at sunset with vibrant colors..."
                  className="min-h-[120px] resize-none rounded-xl border-border/50 bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>

              {/* Style Presets */}
              <div className="mb-4">
                <p className="mb-3 text-sm font-medium text-foreground">
                  Choose a style
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {stylePresets.map((style) => (
                    <motion.button
                      key={style.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${
                        selectedStyle === style.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-card text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {style.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Public Toggle */}
              {isAuthenticated && (
                <div className="mb-6 flex items-center justify-between rounded-xl border border-border/50 bg-card p-3">
                  <div className="flex items-center gap-2">
                    {isPublic ? (
                      <Globe className="h-4 w-4 text-accent" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium text-foreground">
                      Share to Explore
                    </span>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                </div>
              )}

              {/* Generate Button */}
              <div className="mt-auto">
                <GradientButton
                  onClick={handleGenerate}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  <Wand2 className="h-5 w-5" />
                  Generate Image
                </GradientButton>
              </div>
            </motion.div>
          )}

          {isGenerating && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 items-center justify-center"
            >
              <GeneratingAnimation message="Creating your masterpiece..." />
            </motion.div>
          )}

          {generatedImage && !isGenerating && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col"
            >
              {/* Generated Image */}
              <div className="relative mb-4 overflow-hidden rounded-2xl border border-border/50">
                <img
                  src={generatedImage}
                  alt="Generated image"
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-inset ring-foreground/10" />
              </div>

              {/* Prompt Display */}
              <div className="mb-4 rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Prompt</p>
                <p className="text-sm text-foreground">{prompt}</p>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto grid grid-cols-3 gap-3">
                <GradientButton
                  onClick={handleDownload}
                  variant="primary"
                  size="md"
                  className="w-full"
                >
                  <Download className="h-4 w-4" />
                </GradientButton>
                <GradientButton
                  onClick={handleShare}
                  variant="secondary"
                  size="md"
                  className="w-full"
                >
                  <Share2 className="h-4 w-4" />
                </GradientButton>
                <GradientButton
                  onClick={handleReset}
                  variant="accent"
                  size="md"
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4" />
                </GradientButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}
