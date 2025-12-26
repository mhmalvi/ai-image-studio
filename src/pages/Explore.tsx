import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Heart, TrendingUp, Clock, Flame, Download } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ImageModal } from "@/components/ui/image-modal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

type SortOption = "recent" | "popular" | "trending";

interface ExploreImage {
  id: string;
  image_url: string;
  prompt: string | null;
  style: string | null;
  likes_count: number;
  created_at: string;
  user_id: string;
  isLiked?: boolean;
}

export default function Explore() {
  const [images, setImages] = useState<ExploreImage[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<ExploreImage | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchImages();
  }, [sortBy]);

  useEffect(() => {
    if (user) {
      fetchUserLikes();
    }
  }, [user]);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("generated_images")
        .select("*")
        .eq("is_public", true);

      if (sortBy === "recent") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "popular") {
        query = query.order("likes_count", { ascending: false });
      } else {
        // trending: recent with high likes
        query = query
          .order("likes_count", { ascending: false })
          .order("created_at", { ascending: false });
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("image_likes")
      .select("image_id")
      .eq("user_id", user.id);

    if (!error && data) {
      setLikedImages(new Set(data.map((l) => l.image_id)));
    }
  };

  const handleLike = async (imageId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like images",
        variant: "destructive",
      });
      return;
    }

    const isLiked = likedImages.has(imageId);

    try {
      if (isLiked) {
        await supabase
          .from("image_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("image_id", imageId);

        setLikedImages((prev) => {
          const next = new Set(prev);
          next.delete(imageId);
          return next;
        });

        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, likes_count: Math.max(0, img.likes_count - 1) }
              : img
          )
        );
      } else {
        await supabase.from("image_likes").insert({
          user_id: user.id,
          image_id: imageId,
        });

        setLikedImages((prev) => new Set(prev).add(imageId));

        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, likes_count: img.likes_count + 1 }
              : img
          )
        );
      }
    } catch (error) {
      console.error("Like error:", error);
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

  const sortOptions = [
    { id: "popular" as SortOption, label: "Popular", icon: Flame },
    { id: "recent" as SortOption, label: "Recent", icon: Clock },
    { id: "trending" as SortOption, label: "Trending", icon: TrendingUp },
  ];

  return (
    <PageLayout>
      <div className="flex min-h-screen flex-col px-4 pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h1 className="text-2xl font-bold text-foreground">
            <span className="text-gradient-accent">Explore</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Discover amazing AI creations
          </p>
        </motion.div>

        {/* Sort Options */}
        <div className="mb-4 flex gap-2">
          {sortOptions.map((option) => (
            <motion.button
              key={option.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortBy(option.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                sortBy === option.id
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <option.icon className="h-3.5 w-3.5" />
              {option.label}
            </motion.button>
          ))}
        </div>

        {/* Image Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-3"
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-2xl bg-muted"
                />
              ))}
            </motion.div>
          ) : images.length > 0 ? (
            <motion.div
              key="images"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-3 pb-24"
            >
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/50"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.image_url}
                    alt={image.prompt || "AI generated image"}
                    className="aspect-square w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  
                  {/* Like button */}
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(image.id);
                    }}
                    className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 backdrop-blur-sm"
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors ${
                        likedImages.has(image.id)
                          ? "fill-destructive text-destructive"
                          : "text-foreground"
                      }`}
                    />
                    <span className="text-xs font-medium text-foreground">
                      {image.likes_count}
                    </span>
                  </motion.button>

                  {/* Prompt overlay */}
                  {image.prompt && (
                    <div className="absolute bottom-0 left-0 right-10 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="line-clamp-2 text-xs text-foreground">
                        {image.prompt}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col items-center justify-center"
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
                <Compass className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                No public images yet
              </h3>
              <p className="text-center text-sm text-muted-foreground">
                Be the first to share your creations!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Preview Modal */}
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          src={selectedImage?.image_url || ""}
          prompt={selectedImage?.prompt || undefined}
          onDownload={() => selectedImage && handleDownload(selectedImage.image_url)}
        />
      </div>
    </PageLayout>
  );
}
