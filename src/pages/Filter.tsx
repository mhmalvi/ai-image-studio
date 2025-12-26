import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Camera, Upload, Wand2, Download, RotateCcw } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { GradientButton } from "@/components/ui/gradient-button";
import { GeneratingAnimation } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const filterPresets = [
  { id: "oil-painting", label: "Oil Painting", emoji: "🎨" },
  { id: "cyberpunk", label: "Cyberpunk", emoji: "🌆" },
  { id: "vintage", label: "Vintage", emoji: "📷" },
  { id: "anime", label: "Anime", emoji: "✨" },
  { id: "watercolor", label: "Watercolor", emoji: "💧" },
  { id: "neon-glow", label: "Neon Glow", emoji: "💜" },
];

export default function Filter() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filteredImage, setFilteredImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

    try {
      const { data, error } = await supabase.functions.invoke("apply-filter", {
        body: { 
          imageUrl: selectedImage, 
          filter: selectedFilter 
        },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setFilteredImage(data.imageUrl);
        toast({
          title: "Filter applied!",
          description: "Your image has been transformed",
        });
      }
    } catch (error: any) {
      console.error("Filter error:", error);
      toast({
        title: "Processing failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!filteredImage) return;

    const link = document.createElement("a");
    link.href = filteredImage;
    link.download = `filtered-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded!",
      description: "Image saved to your device",
    });
  };

  const handleReset = () => {
    setSelectedImage(null);
    setSelectedFilter(null);
    setFilteredImage(null);
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

        <AnimatePresence mode="wait">
          {!selectedImage && (
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
                  onClick={() => fileInputRef.current?.click()}
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

          {selectedImage && !isProcessing && (
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
                <div className="grid grid-cols-3 gap-2">
                  {filterPresets.map((filter) => (
                    <motion.button
                      key={filter.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedFilter(filter.id)}
                      className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all ${
                        selectedFilter === filter.id
                          ? "border-accent bg-accent/10"
                          : "border-border/50 bg-card hover:border-accent/30"
                      }`}
                    >
                      <span className="text-xl">{filter.emoji}</span>
                      <span className="text-xs font-medium text-foreground">
                        {filter.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

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
                  <>
                    <GradientButton
                      onClick={handleReset}
                      variant="secondary"
                      size="md"
                      className="w-full"
                    >
                      <RotateCcw className="h-4 w-4" />
                      New
                    </GradientButton>
                    <GradientButton
                      onClick={handleDownload}
                      variant="primary"
                      size="md"
                      className="w-full"
                    >
                      <Download className="h-4 w-4" />
                      Save
                    </GradientButton>
                  </>
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
    </PageLayout>
  );
}
