import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FolderOpen, Globe, Lock } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ImageCard } from "@/components/ui/image-card";
import { ImageModal } from "@/components/ui/image-modal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user) {
        fetchImages();
      } else {
        setIsLoading(false);
      }
    }
  }, [user, isAuthenticated, authLoading]);

  const fetchImages = async () => {
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
  };

  const handleDownload = (src: string) => {
    const link = document.createElement("a");
    link.href = src;
    link.download = `ai-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded!",
      description: "Image saved to your device",
    });
  };

  const handleShare = async (src: string, prompt: string) => {
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
        <div className="flex min-h-screen flex-col px-4 pt-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl font-bold text-foreground">
              My <span className="text-gradient-primary">Gallery</span>
            </h1>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </motion.div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="flex min-h-screen flex-col px-4 pt-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl font-bold text-foreground">
              My <span className="text-gradient-primary">Gallery</span>
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-1 flex-col items-center justify-center"
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
              <FolderOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Sign in to view your gallery
            </h3>
            <p className="text-center text-sm text-muted-foreground">
              Create an account to save and sync your creations
            </p>
          </motion.div>
        </div>
      </PageLayout>
    );
  }

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
            My <span className="text-gradient-primary">Gallery</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Your AI creations ({images.length} images)
          </p>
        </motion.div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 pb-24">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
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
                  className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 backdrop-blur-sm"
                >
                  {image.is_public ? (
                    <Globe className="h-3 w-3 text-accent" />
                  ) : (
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-1 flex-col items-center justify-center"
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
              <FolderOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              No images yet
            </h3>
            <p className="text-center text-sm text-muted-foreground">
              Start creating to build your gallery
            </p>
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
      </div>
    </PageLayout>
  );
}
