import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Download, Share2, Trash2 } from "lucide-react";

interface ImageCardProps {
  src: string;
  alt?: string;
  prompt?: string;
  date?: string;
  onDownload?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function ImageCard({
  src,
  alt = "Generated image",
  prompt,
  date,
  onDownload,
  onShare,
  onDelete,
  className,
}: ImageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card",
        className
      )}
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute bottom-0 left-0 right-0 p-3">
          {prompt && (
            <p className="mb-2 line-clamp-2 text-xs text-foreground/80">
              {prompt}
            </p>
          )}
          {date && (
            <p className="mb-2 text-[10px] text-muted-foreground">{date}</p>
          )}
          <div className="flex gap-2">
            {onDownload && (
              <button
                onClick={onDownload}
                className="rounded-lg bg-primary/20 p-2 backdrop-blur-sm transition-colors hover:bg-primary/30"
              >
                <Download className="h-4 w-4 text-primary" />
              </button>
            )}
            {onShare && (
              <button
                onClick={onShare}
                className="rounded-lg bg-secondary/20 p-2 backdrop-blur-sm transition-colors hover:bg-secondary/30"
              >
                <Share2 className="h-4 w-4 text-secondary" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="rounded-lg bg-destructive/20 p-2 backdrop-blur-sm transition-colors hover:bg-destructive/30"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
