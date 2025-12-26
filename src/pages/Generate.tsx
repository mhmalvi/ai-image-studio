import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, Download, Share2, RotateCcw, Globe, Lock, RefreshCw, Pencil } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { GradientButton } from "@/components/ui/gradient-button";
import { GeneratingAnimation } from "@/components/ui/loading-spinner";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ImageEditor } from "@/components/editor/ImageEditor";

const stylePresets = [
  { id: "artistic", label: "Artistic", emoji: "🎨" },
  { id: "photorealistic", label: "Photorealistic", emoji: "📷" },
  { id: "anime", label: "Anime", emoji: "✨" },
  { id: "cyberpunk", label: "Cyberpunk", emoji: "🌆" },
  { id: "oil-painting", label: "Oil Painting", emoji: "🖼️" },
  { id: "vintage", label: "Vintage", emoji: "📸" },
  { id: "watercolor", label: "Watercolor", emoji: "💧" },
  { id: "neon-glow", label: "Neon Glow", emoji: "💜" },
  { id: "sketch", label: "Sketch", emoji: "✏️" },
  { id: "pop-art", label: "Pop Art", emoji: "🎭" },
  { id: "noir", label: "Film Noir", emoji: "🎬" },
  { id: "fantasy", label: "Fantasy", emoji: "🧙" },
];

export default function Generate() {
  const [searchParams] = useSearchParams();
  const initialStyle = searchParams.get("style") || "artistic";
  
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(initialStyle);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Update style when URL param changes
  useEffect(() => {
    const styleFromUrl = searchParams.get("style");
    if (styleFromUrl && stylePresets.some(s => s.id === styleFromUrl)) {
      setSelectedStyle(styleFromUrl);
    }
  }, [searchParams]);

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
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-image", {
        body: { prompt, style: selectedStyle },
      });

      if (fnError) throw fnError;

      if (data?.error) {
        // Handle specific errors
        if (data.error.includes("Rate limit")) {
          setError("rate_limit");
          toast({
            title: "Too many requests",
            description: "Please wait a moment and try again",
            variant: "destructive",
          });
          return;
        }
        if (data.error.includes("Credits")) {
          setError("credits");
          toast({
            title: "Credits exhausted",
            description: "Please try again later",
            variant: "destructive",
          });
          return;
        }
        throw new Error(data.error);
      }

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
      setError("general");
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

  const handleDownload = async () => {
    if (!generatedImage) return;

    toast({ title: "Downloading...", description: "Preparing your image" });

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `ai-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Downloaded!",
        description: "Image saved to your device",
      });
    } catch (err) {
      toast({
        title: "Download failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
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
    setError(null);
    setIsEditing(false);
  };

  const handleRetry = () => {
    setError(null);
    handleGenerate();
  };

  const handleEditSave = (editedImageUrl: string) => {
    setGeneratedImage(editedImageUrl);
    setIsEditing(false);
    toast({ title: "Edits applied!", description: "Your image has been updated" });
  };

  return (
    <PageLayout>
      <div className="flex min-h-screen flex-col px-4 pt-6 pb-28">
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
          {/* Error State with Retry */}
          {error && !isGenerating && !generatedImage && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col items-center justify-center"
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
                <RefreshCw className="h-10 w-10 text-destructive" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {error === "rate_limit" ? "Too many requests" : 
                 error === "credits" ? "Credits exhausted" : "Something went wrong"}
              </h3>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                {error === "rate_limit" ? "Wait a moment before trying again" :
                 error === "credits" ? "Please try again later" : "Please try again"}
              </p>
              <div className="flex gap-3">
                <GradientButton onClick={handleReset} variant="secondary" size="md">
                  <RotateCcw className="h-4 w-4" />
                  Start Over
                </GradientButton>
                <GradientButton onClick={handleRetry} variant="primary" size="md">
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </GradientButton>
              </div>
            </motion.div>
          )}

          {!generatedImage && !isGenerating && !error && (
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

              {/* Style Presets - 12 styles */}
              <div className="mb-4">
                <p className="mb-3 text-sm font-medium text-foreground">
                  Choose a style
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {stylePresets.map((style) => (
                    <motion.button
                      key={style.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 text-sm font-medium transition-all ${
                        selectedStyle === style.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-card text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <span className="text-lg">{style.emoji}</span>
                      <span className="text-[10px] font-medium line-clamp-1">{style.label}</span>
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
              <div className="mt-auto grid grid-cols-4 gap-2">
                <GradientButton
                  onClick={() => setIsEditing(true)}
                  variant="accent"
                  size="md"
                  className="w-full"
                >
                  <Pencil className="h-4 w-4" />
                </GradientButton>
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
                  variant="secondary"
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

      {/* Image Editor Modal */}
      <AnimatePresence>
        {isEditing && generatedImage && (
          <ImageEditor
            imageUrl={generatedImage}
            onSave={handleEditSave}
            onCancel={() => setIsEditing(false)}
          />
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
