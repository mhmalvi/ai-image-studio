import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FolderOpen, Globe, Lock } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { ImageCard } from "@/components/ui/image-card";
import { ImageModal } from "@/components/ui/image-modal";
import { useToast } from "@/hooks/use-toast";
import { useHaptics } from "@/hooks/useHaptics";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { headerVariants, containerVariants, itemVariants, gridContainerVariants, gridItemVariants } from "@/lib/animations";

interface GalleryImage {
  id: string;
  image_url: string;
  prompt: string | null;
  style: string | null;
  is_public: boolean;
  created_at: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { lightImpact, successNotification } = useHaptics();

  const fetchImages = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("generated_images")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user) {
        fetchImages();
      } else {
        setIsLoading(false);
      }
    }
  }, [user, isAuthenticated, authLoading, fetchImages]);

  const handleRefresh = async () => {
    await fetchImages();
  };

  const handleDownload = (src: string) => {
    lightImpact();
    const link = document.createElement("a");
    link.href = src;
    link.download = `ai-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    successNotification();
    toast({
      title: "Downloaded!",
      description: "Image saved to your device",
    });
  };

  const handleShare = async (src: string, prompt: string) => {
    lightImpact();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI Generated Image",
          text: prompt,
          url: src,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(src);
      toast({
        title: "Link copied!",
        description: "Image URL copied to clipboard",
      });
    }
  };

  const handleDelete = async (id: string) => {
    lightImpact();
    try {
      const { error } = await supabase
        .from("generated_images")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setImages(images.filter((img) => img.id !== id));
      toast({
        title: "Deleted",
        description: "Image removed from gallery",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const togglePublic = async (id: string, currentPublic: boolean) => {
    lightImpact();
    try {
      const { error } = await supabase
        .from("generated_images")
        .update({ is_public: !currentPublic })
        .eq("id", id);

      if (error) throw error;

      setImages(images.map((img) =>
        img.id === id ? { ...img, is_public: !currentPublic } : img
      ));

      toast({
        title: !currentPublic ? "Shared to Explore" : "Made private",
        description: !currentPublic
          ? "Your image is now visible to everyone"
          : "Your image is now private",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update visibility",
        variant: "destructive",
      });
    }
  };

  if (authLoading || isLoading) {
    return (
      <PageLayout>
        <PageTransition className="flex flex-col h-full px-4 pt-4">
          <motion.div
            variants={headerVariants}
            initial="initial"
            animate="animate"
            className="mb-4"
          >
            <h1 className="text-2xl font-bold text-foreground">
              My <span className="text-gradient-primary">Gallery</span>
            </h1>
            <p className="text-xs text-muted-foreground">Loading...</p>
          </motion.div>
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        </PageTransition>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <PageTransition className="flex flex-col h-full px-4 pt-4">
          <motion.div
            variants={headerVariants}
            initial="initial"
            animate="animate"
            className="mb-4"
          >
            <h1 className="text-2xl font-bold text-foreground">
              My <span className="text-gradient-primary">Gallery</span>
            </h1>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="flex flex-1 flex-col items-center justify-center"
          >
            <motion.div variants={itemVariants} className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </motion.div>
            <motion.h3 variants={itemVariants} className="mb-2 text-base font-semibold text-foreground">
              Sign in to view your gallery
            </motion.h3>
            <motion.p variants={itemVariants} className="text-center text-xs text-muted-foreground">
              Create an account to save and sync your creations
            </motion.p>
          </motion.div>
        </PageTransition>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageTransition className="flex flex-col h-full px-4 pt-4">
        {/* Header */}
        <motion.div
          variants={headerVariants}
          initial="initial"
          animate="animate"
          className="mb-4 flex-shrink-0"
        >
          <h1 className="text-2xl font-bold text-foreground">
            My <span className="text-gradient-primary">Gallery</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Your AI creations ({images.length} images) • Pull to refresh
          </p>
        </motion.div>

        {images.length > 0 ? (
          <PullToRefresh onRefresh={handleRefresh} className="flex-1 scrollbar-hide pb-4">
            <motion.div
              variants={gridContainerVariants}
              initial="initial"
              animate="animate"
              className="grid grid-cols-2 gap-2"
            >
              {images.map((image) => (
                <motion.div
                  key={image.id}
                  variants={gridItemVariants}
                  className="relative cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <ImageCard
                    src={image.image_url}
                    prompt={image.prompt || undefined}
                    date={formatDate(image.created_at)}
                    onDownload={() => handleDownload(image.image_url)}
                    onShare={() => handleShare(image.image_url, image.prompt || "")}
                    onDelete={() => handleDelete(image.id)}
                  />
                  {/* Public indicator */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePublic(image.id, image.is_public);
                    }}
                    className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-background/80 px-1.5 py-0.5 backdrop-blur-sm"
                  >
                    {image.is_public ? (
                      <Globe className="h-3 w-3 text-accent" />
                    ) : (
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    )}
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </PullToRefresh>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="flex flex-1 flex-col items-center justify-center"
          >
            <motion.div variants={itemVariants} className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </motion.div>
            <motion.h3 variants={itemVariants} className="mb-2 text-base font-semibold text-foreground">
              No images yet
            </motion.h3>
            <motion.p variants={itemVariants} className="text-center text-xs text-muted-foreground">
              Start creating to build your gallery
            </motion.p>
          </motion.div>
        )}

        {/* Image Preview Modal */}
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          src={selectedImage?.image_url || ""}
          prompt={selectedImage?.prompt || undefined}
          onDownload={() => selectedImage && handleDownload(selectedImage.image_url)}
          onShare={() => selectedImage && handleShare(selectedImage.image_url, selectedImage.prompt || "")}
        />
      </PageTransition>
    </PageLayout>
  );
}
