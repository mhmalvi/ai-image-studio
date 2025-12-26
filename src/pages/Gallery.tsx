import { useState } from "react";
import { motion } from "framer-motion";
import { FolderOpen, Image as ImageIcon } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ImageCard } from "@/components/ui/image-card";
import { useToast } from "@/hooks/use-toast";

// Mock data for demo - will be replaced with actual data from database
const mockGallery = [
  {
    id: "1",
    src: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400&h=400&fit=crop",
    prompt: "A serene mountain landscape at sunset",
    date: "Today",
  },
  {
    id: "2",
    src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop",
    prompt: "Cyberpunk city with neon lights",
    date: "Yesterday",
  },
  {
    id: "3",
    src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=400&fit=crop",
    prompt: "Abstract fluid art in vibrant colors",
    date: "2 days ago",
  },
  {
    id: "4",
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    prompt: "Dreamy alpine landscape",
    date: "3 days ago",
  },
];

export default function Gallery() {
  const [images, setImages] = useState(mockGallery);
  const { toast } = useToast();

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

  const handleDelete = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
    toast({
      title: "Deleted",
      description: "Image removed from gallery",
    });
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
            My <span className="text-gradient-primary">Gallery</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Your AI creations ({images.length} images)
          </p>
        </motion.div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <ImageCard
                  src={image.src}
                  prompt={image.prompt}
                  date={image.date}
                  onDownload={() => handleDownload(image.src)}
                  onShare={() => handleShare(image.src, image.prompt || "")}
                  onDelete={() => handleDelete(image.id)}
                />
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
      </div>
    </PageLayout>
  );
}
