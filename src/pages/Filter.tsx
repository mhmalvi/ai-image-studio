import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Camera, Upload, Wand2, Download, RotateCcw, Globe, Lock, RefreshCw, Pencil } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { GradientButton } from "@/components/ui/gradient-button";
import { GeneratingAnimation } from "@/components/ui/loading-spinner";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ImageEditor } from "@/components/editor/ImageEditor";

const filterPresets = [
  { id: "oil-painting", label: "Oil Painting", emoji: "🎨" },
  { id: "cyberpunk", label: "Cyberpunk", emoji: "🌆" },
  { id: "vintage", label: "Vintage", emoji: "📷" },
  { id: "anime", label: "Anime", emoji: "✨" },
  { id: "watercolor", label: "Watercolor", emoji: "💧" },
  { id: "neon-glow", label: "Neon Glow", emoji: "💜" },
  { id: "sketch", label: "Pencil Sketch", emoji: "✏️" },
  { id: "pop-art", label: "Pop Art", emoji: "🎭" },
  { id: "pixel-art", label: "Pixel Art", emoji: "👾" },
  { id: "dreamy", label: "Dreamy", emoji: "☁️" },
  { id: "noir", label: "Film Noir", emoji: "🎬" },
  { id: "fantasy", label: "Fantasy", emoji: "🧙" },
];

export default function Filter() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [intensity, setIntensity] = useState([70]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filteredImage, setFilteredImage] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setFilteredImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyFilter = async () => {
    if (!selectedImage || !selectedFilter) {
      toast({
        title: "Select an image and filter",
        description: "Choose a photo and a filter style to apply",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setFilteredImage(null);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("apply-filter", {
        body: { 
          imageUrl: selectedImage, 
          filter: selectedFilter,
          intensity: intensity[0],
        },
      });

      if (fnError) throw fnError;

      if (data?.error) {
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
        setFilteredImage(data.imageUrl);
        
        // Save to database if authenticated
        if (isAuthenticated && user) {
          await saveToDatabase(data.imageUrl);
        }

        toast({
          title: "Filter applied!",
          description: isAuthenticated ? "Saved to your gallery" : "Sign in to save your creations",
        });
      }
    } catch (error: any) {
      console.error("Filter error:", error);
      setError("general");
      toast({
        title: "Processing failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const saveToDatabase = async (imageUrl: string) => {
    if (!user) return;

    const filterLabel = filterPresets.find((f) => f.id === selectedFilter)?.label || selectedFilter;

    await supabase.from("generated_images").insert({
      user_id: user.id,
      image_url: imageUrl,
      prompt: `${filterLabel} filter at ${intensity[0]}% intensity`,
      style: selectedFilter,
      type: "filtered",
      is_public: isPublic,
    });
  };

  const handleDownload = async () => {
    if (!filteredImage) return;

    toast({ title: "Downloading...", description: "Preparing your image" });

    try {
      const response = await fetch(filteredImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `filtered-image-${Date.now()}.png`;
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

  const handleReset = () => {
    setSelectedImage(null);
    setSelectedFilter(null);
    setFilteredImage(null);
    setIntensity([70]);
    setIsPublic(false);
    setError(null);
    setIsEditing(false);
  };

  const handleRetry = () => {
    setError(null);
    handleApplyFilter();
  };

  const handleEditSave = (editedImageUrl: string) => {
    setFilteredImage(editedImageUrl);
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
            AI <span className="text-gradient-accent">Filters</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Transform your photos with AI magic
          </p>
        </motion.div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {/* Error State with Retry */}
          {error && !isProcessing && (
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

          {!selectedImage && !error && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col items-center justify-center"
            >
              <motion.div
                className="mb-6 rounded-3xl border-2 border-dashed border-border/50 p-12"
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-accent">
                    <ImageIcon className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">
                      Upload a photo
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tap to select from gallery
                    </p>
                  </div>
                </div>
              </motion.div>

              <div className="grid w-full grid-cols-2 gap-3">
                <GradientButton
                  onClick={() => fileInputRef.current?.click()}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  <Upload className="h-5 w-5" />
                  Gallery
                </GradientButton>
                <GradientButton
                  onClick={() => cameraInputRef.current?.click()}
                  variant="accent"
                  size="lg"
                  className="w-full"
                >
                  <Camera className="h-5 w-5" />
                  Camera
                </GradientButton>
              </div>
            </motion.div>
          )}

          {selectedImage && !isProcessing && !error && (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col"
            >
              {/* Image Preview */}
              <div className="relative mb-4 overflow-hidden rounded-2xl border border-border/50">
                <img
                  src={filteredImage || selectedImage}
                  alt="Selected image"
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-inset ring-foreground/10" />
              </div>

              {/* Filter Selection */}
              <div className="mb-4">
                <p className="mb-3 text-sm font-medium text-foreground">
                  Choose a filter
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {filterPresets.map((filter) => (
                    <motion.button
                      key={filter.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedFilter(filter.id)}
                      className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition-all ${
                        selectedFilter === filter.id
                          ? "border-accent bg-accent/10"
                          : "border-border/50 bg-card hover:border-accent/30"
                      }`}
                    >
                      <span className="text-lg">{filter.emoji}</span>
                      <span className="text-[10px] font-medium text-foreground line-clamp-1">
                        {filter.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Intensity Slider */}
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    Intensity
                  </p>
                  <span className="text-sm text-muted-foreground">
                    {intensity[0]}%
                  </span>
                </div>
                <Slider
                  value={intensity}
                  onValueChange={setIntensity}
                  max={100}
                  min={10}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Public Toggle */}
              {isAuthenticated && (
                <div className="mb-4 flex items-center justify-between rounded-xl border border-border/50 bg-card p-3">
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

              {/* Action Buttons */}
              <div className="mt-auto grid grid-cols-2 gap-3">
                {!filteredImage ? (
                  <>
                    <GradientButton
                      onClick={handleReset}
                      variant="secondary"
                      size="md"
                      className="w-full"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </GradientButton>
                    <GradientButton
                      onClick={handleApplyFilter}
                      variant="accent"
                      size="md"
                      className="w-full"
                      disabled={!selectedFilter}
                    >
                      <Wand2 className="h-4 w-4" />
                      Apply
                    </GradientButton>
                  </>
                ) : (
                  <div className="col-span-2 grid grid-cols-3 gap-2">
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
                      onClick={handleReset}
                      variant="secondary"
                      size="md"
                      className="w-full"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </GradientButton>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {isProcessing && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 items-center justify-center"
            >
              <GeneratingAnimation message="Applying AI magic..." />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Image Editor Modal */}
      <AnimatePresence>
        {isEditing && filteredImage && (
          <ImageEditor
            imageUrl={filteredImage}
            onSave={handleEditSave}
            onCancel={() => setIsEditing(false)}
          />
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
