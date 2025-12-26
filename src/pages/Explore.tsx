import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Heart, TrendingUp, Clock, Flame } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { ImageModal } from "@/components/ui/image-modal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHaptics } from "@/hooks/useHaptics";
import { headerVariants, containerVariants, itemVariants, gridContainerVariants, gridItemVariants, buttonTapAnimation } from "@/lib/animations";
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
  const { lightImpact, mediumImpact, successNotification } = useHaptics();

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

  const fetchImages = useCallback(async () => {
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
  }, [sortBy]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    if (user) {
      fetchUserLikes();
    }
  }, [user]);

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

  const handleRefresh = async () => {
    await fetchImages();
    if (user) await fetchUserLikes();
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

    mediumImpact();
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

  const handleSortChange = (option: SortOption) => {
    lightImpact();
    setSortBy(option);
  };

  const sortOptions = [
    { id: "popular" as SortOption, label: "Popular", icon: Flame },
    { id: "recent" as SortOption, label: "Recent", icon: Clock },
    { id: "trending" as SortOption, label: "Trending", icon: TrendingUp },
  ];

  return (
    <PageLayout>
      <PageTransition className="flex flex-col h-full px-4 pt-4">
        {/* Header */}
        <motion.div
          variants={headerVariants}
          initial="initial"
          animate="animate"
          className="mb-3 flex-shrink-0"
        >
          <h1 className="text-2xl font-bold text-foreground">
            <span className="text-gradient-accent">Explore</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Discover amazing AI creations • Pull to refresh
          </p>
        </motion.div>

        {/* Sort Options */}
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="mb-3 flex gap-2 flex-shrink-0"
        >
          {sortOptions.map((option) => (
            <motion.button
              key={option.id}
              variants={itemVariants}
              whileTap={buttonTapAnimation}
              onClick={() => handleSortChange(option.id)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                sortBy === option.id
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <option.icon className="h-3 w-3" />
              {option.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Image Grid */}
        <PullToRefresh onRefresh={handleRefresh} className="flex-1 scrollbar-hide pb-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="initial"
                className="grid grid-cols-2 gap-2"
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    className="aspect-square animate-pulse rounded-xl bg-muted"
                  />
                ))}
              </motion.div>
            ) : images.length > 0 ? (
              <motion.div
                key="images"
                variants={gridContainerVariants}
                initial="initial"
                animate="animate"
                exit="initial"
                className="grid grid-cols-2 gap-2"
              >
                {images.map((image) => (
                  <motion.div
                    key={image.id}
                    variants={gridItemVariants}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/50"
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
                      whileTap={buttonTapAnimation}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(image.id);
                      }}
                      className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 rounded-full bg-background/80 px-1.5 py-0.5 backdrop-blur-sm"
                    >
                      <Heart
                        className={`h-3 w-3 transition-colors ${
                          likedImages.has(image.id)
                            ? "fill-destructive text-destructive"
                            : "text-foreground"
                        }`}
                      />
                      <span className="text-[10px] font-medium text-foreground">
                        {image.likes_count}
                      </span>
                    </motion.button>

                    {/* Prompt overlay */}
                    {image.prompt && (
                      <div className="absolute bottom-0 left-0 right-8 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <p className="line-clamp-2 text-[10px] text-foreground">
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
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="initial"
                className="flex flex-1 flex-col items-center justify-center py-20"
              >
                <motion.div variants={itemVariants} className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                  <Compass className="h-8 w-8 text-muted-foreground" />
                </motion.div>
                <motion.h3 variants={itemVariants} className="mb-2 text-base font-semibold text-foreground">
                  No public images yet
                </motion.h3>
                <motion.p variants={itemVariants} className="text-center text-xs text-muted-foreground">
                  Be the first to share your creations!
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </PullToRefresh>

        {/* Image Preview Modal */}
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          src={selectedImage?.image_url || ""}
          prompt={selectedImage?.prompt || undefined}
          onDownload={() => selectedImage && handleDownload(selectedImage.image_url)}
        />
      </PageTransition>
    </PageLayout>
  );
}
