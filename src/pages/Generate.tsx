import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, Download, Share2, RotateCcw, Globe, Lock, RefreshCw, Pencil } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { GradientButton } from "@/components/ui/gradient-button";
import { GeneratingAnimation } from "@/components/ui/loading-spinner";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useHaptics } from "@/hooks/useHaptics";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ImageEditor } from "@/components/editor/ImageEditor";
import { headerVariants, containerVariants, itemVariants, buttonTapAnimation } from "@/lib/animations";

const stylePresets = [
  { id: "artistic", label: "Artistic", emoji: "🎨", isPro: false },
  { id: "photorealistic", label: "Photorealistic", emoji: "📷", isPro: false },
  { id: "anime", label: "Anime", emoji: "✨", isPro: false },
  { id: "cyberpunk", label: "Cyberpunk", emoji: "🌆", isPro: false },
  { id: "oil-painting", label: "Oil Painting", emoji: "🖼️", isPro: false },
  { id: "vintage", label: "Vintage", emoji: "📸", isPro: false },
  { id: "watercolor", label: "Watercolor", emoji: "💧", isPro: false },
  { id: "neon-glow", label: "Neon Glow", emoji: "💜", isPro: false },
  { id: "sketch", label: "Sketch", emoji: "✏️", isPro: true },
  { id: "pop-art", label: "Pop Art", emoji: "🎭", isPro: true },
  { id: "noir", label: "Film Noir", emoji: "🎬", isPro: true },
  { id: "fantasy", label: "Fantasy", emoji: "🧙", isPro: true },
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
  const { lightImpact, mediumImpact, successNotification, errorNotification } = useHaptics();

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

    mediumImpact();
    setIsGenerating(true);
    setGeneratedImage(null);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-image", {
        body: { prompt, style: selectedStyle },
      });

      if (fnError) throw fnError;

      if (data?.error) {
        if (data.error.includes("Rate limit")) {
          setError("rate_limit");
          errorNotification();
          toast({
            title: "Too many requests",
            description: "Please wait a moment and try again",
            variant: "destructive",
          });
          return;
        }
        if (data.error.includes("Credits")) {
          setError("credits");
          errorNotification();
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
        successNotification();
        
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
      errorNotification();
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
    mediumImpact();
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

      successNotification();
      toast({
        title: "Downloaded!",
        description: "Image saved to your device",
      });
    } catch (err) {
      errorNotification();
      toast({
        title: "Download failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!generatedImage) return;
    lightImpact();

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
    lightImpact();
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
    successNotification();
    toast({ title: "Edits applied!", description: "Your image has been updated" });
  };

  const handleStyleSelect = (styleId: string) => {
    lightImpact();
    setSelectedStyle(styleId);
  };

  return (
    <PageLayout>
      <PageTransition className="flex flex-col h-full px-4 pt-4 pb-4">
        {/* Header */}
        <motion.div
          variants={headerVariants}
          initial="initial"
          animate="animate"
          className="mb-4 flex-shrink-0"
        >
          <h1 className="text-2xl font-bold text-foreground">
            Generate <span className="text-gradient-primary">Image</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Describe your vision and let AI create it
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Error State */}
          {error && !isGenerating && !generatedImage && (
            <motion.div
              key="error"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="initial"
              className="flex flex-1 flex-col items-center justify-center"
            >
              <motion.div variants={itemVariants} className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-destructive/10">
                <RefreshCw className="h-8 w-8 text-destructive" />
              </motion.div>
              <motion.h3 variants={itemVariants} className="mb-2 text-base font-semibold text-foreground">
                {error === "rate_limit" ? "Too many requests" : 
                 error === "credits" ? "Credits exhausted" : "Something went wrong"}
              </motion.h3>
              <motion.p variants={itemVariants} className="mb-4 text-center text-xs text-muted-foreground">
                {error === "rate_limit" ? "Wait a moment before trying again" :
                 error === "credits" ? "Please try again later" : "Please try again"}
              </motion.p>
              <motion.div variants={itemVariants} className="flex gap-2">
                <GradientButton onClick={handleReset} variant="secondary" size="sm">
                  <RotateCcw className="h-4 w-4" />
                  Start Over
                </GradientButton>
                <GradientButton onClick={handleRetry} variant="primary" size="sm">
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </GradientButton>
              </motion.div>
            </motion.div>
          )}

          {/* Input State */}
          {!generatedImage && !isGenerating && !error && (
            <motion.div
              key="input"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="initial"
              className="flex flex-1 flex-col overflow-hidden"
            >
              {/* Prompt Input */}
              <motion.div variants={itemVariants} className="mb-3 flex-shrink-0">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A serene mountain landscape at sunset with vibrant colors..."
                  className="min-h-[80px] max-h-[100px] resize-none rounded-xl border-border/50 bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary text-sm"
                />
              </motion.div>

              {/* Style Presets */}
              <motion.div variants={itemVariants} className="mb-3 flex-shrink-0">
                <p className="mb-2 text-xs font-medium text-foreground">
                  Choose a style
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {stylePresets.map((style) => (
                    <motion.button
                      key={style.id}
                      whileTap={buttonTapAnimation}
                      onClick={() => handleStyleSelect(style.id)}
                      className={`relative flex flex-col items-center gap-0.5 rounded-lg border-2 p-1.5 transition-all ${
                        selectedStyle === style.id
                          ? "border-primary bg-primary/10"
                          : "border-border/50 bg-card hover:border-primary/30"
                      }`}
                    >
                      <span className="text-base">{style.emoji}</span>
                      <span className="text-[8px] font-medium text-foreground line-clamp-1">{style.label}</span>
                      {style.isPro && (
                        <span className="absolute -top-1 -right-1 px-1 py-0.5 text-[6px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full">
                          PRO
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Public Toggle */}
              {isAuthenticated && (
                <motion.div variants={itemVariants} className="mb-3 flex items-center justify-between rounded-lg border border-border/50 bg-card p-2 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    {isPublic ? (
                      <Globe className="h-3.5 w-3.5 text-accent" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className="text-xs font-medium text-foreground">
                      Share to Explore
                    </span>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                </motion.div>
              )}

              {/* Generate Button */}
              <motion.div variants={itemVariants} className="mt-auto flex-shrink-0">
                <GradientButton onClick={handleGenerate} variant="primary" size="md" className="w-full">
                  <Wand2 className="h-4 w-4" />
                  Generate Image
                </GradientButton>
              </motion.div>
            </motion.div>
          )}

          {/* Generating State */}
          {isGenerating && (
            <motion.div
              key="generating"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="initial"
              className="flex flex-1 items-center justify-center"
            >
              <GeneratingAnimation message="Creating your masterpiece..." />
            </motion.div>
          )}

          {/* Result State */}
          {generatedImage && !isGenerating && (
            <motion.div
              key="result"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="initial"
              className="flex flex-1 flex-col overflow-hidden"
            >
              {/* Generated Image */}
              <motion.div variants={itemVariants} className="relative mb-3 overflow-hidden rounded-xl border border-border/50 flex-shrink-0">
                <img
                  src={generatedImage}
                  alt="Generated image"
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-inset ring-foreground/10" />
              </motion.div>

              {/* Prompt Display */}
              <motion.div variants={itemVariants} className="mb-3 rounded-lg bg-muted/50 p-2 flex-shrink-0">
                <p className="text-[10px] text-muted-foreground">Prompt</p>
                <p className="text-xs text-foreground line-clamp-2">{prompt}</p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div variants={itemVariants} className="mt-auto grid grid-cols-4 gap-2 flex-shrink-0">
                <GradientButton onClick={() => setIsEditing(true)} variant="accent" size="sm" className="w-full">
                  <Pencil className="h-4 w-4" />
                </GradientButton>
                <GradientButton onClick={handleDownload} variant="primary" size="sm" className="w-full">
                  <Download className="h-4 w-4" />
                </GradientButton>
                <GradientButton onClick={handleShare} variant="secondary" size="sm" className="w-full">
                  <Share2 className="h-4 w-4" />
                </GradientButton>
                <GradientButton onClick={handleReset} variant="secondary" size="sm" className="w-full">
                  <RotateCcw className="h-4 w-4" />
                </GradientButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </PageTransition>

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
