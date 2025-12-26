import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  prompt?: string;
  onDownload?: () => void;
  onShare?: () => void;
}

export function ImageModal({ isOpen, onClose, src, prompt, onDownload, onShare }: ImageModalProps) {
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.5, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.5, 1));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80"
          >
            <X className="h-5 w-5" />
          </motion.button>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-muted/90 p-2 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-background/50 disabled:opacity-50"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 3}
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-background/50 disabled:opacity-50"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            {onDownload && (
              <button
                onClick={onDownload}
                className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-background/50"
              >
                <Download className="h-5 w-5" />
              </button>
            )}
            {onShare && (
              <button
                onClick={onShare}
                className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-background/50"
              >
                <Share2 className="h-5 w-5" />
              </button>
            )}
          </motion.div>

          {/* Image container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-h-[80vh] max-w-[90vw] overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.img
              src={src}
              alt={prompt || "AI generated image"}
              className="max-h-[80vh] max-w-[90vw] object-contain"
              style={{ scale }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </motion.div>

          {/* Prompt display */}
          {prompt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-4 right-4 top-4 max-w-md rounded-xl bg-muted/80 p-3 backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs text-muted-foreground">Prompt</p>
              <p className="text-sm text-foreground line-clamp-2">{prompt}</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
