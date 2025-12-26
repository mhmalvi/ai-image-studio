import { motion, AnimatePresence } from "framer-motion";
import { X, Link2, Download, MessageCircle, Send, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useHaptics } from "@/hooks/useHaptics";
import { useToast } from "@/hooks/use-toast";
import { Capacitor } from "@capacitor/core";

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  text?: string;
}

const shareOptions = [
  { id: "copy", label: "Copy Link", icon: Link2, color: "bg-muted" },
  { id: "download", label: "Save Image", icon: Download, color: "bg-primary/20" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "bg-green-500/20" },
  { id: "telegram", label: "Telegram", icon: Send, color: "bg-blue-500/20" },
];

export function ShareSheet({ isOpen, onClose, imageUrl, title = "Check out my AI creation!", text }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);
  const { lightImpact, successNotification } = useHaptics();
  const { toast } = useToast();

  const handleShare = async (optionId: string) => {
    lightImpact();

    switch (optionId) {
      case "copy":
        await navigator.clipboard.writeText(imageUrl);
        setCopied(true);
        successNotification();
        toast({ title: "Link copied!", description: "Image URL copied to clipboard" });
        setTimeout(() => setCopied(false), 2000);
        break;

      case "download":
        try {
          const response = await fetch(imageUrl);
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
          toast({ title: "Downloaded!", description: "Image saved to your device" });
        } catch (error) {
          toast({ title: "Download failed", variant: "destructive" });
        }
        break;

      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(`${title}\n${imageUrl}`)}`, "_blank");
        break;

      case "telegram":
        window.open(`https://t.me/share/url?url=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(title)}`, "_blank");
        break;
    }
  };

  const handleNativeShare = async () => {
    if (Capacitor.isNativePlatform()) {
      const { Share } = await import("@capacitor/share");
      await Share.share({
        title,
        text: text || title,
        url: imageUrl,
        dialogTitle: "Share your creation",
      });
    } else if (navigator.share) {
      await navigator.share({
        title,
        text: text || title,
        url: imageUrl,
      });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-3xl z-50 safe-bottom"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4">
              <h3 className="text-lg font-bold text-foreground">Share</h3>
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.9 }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </motion.button>
            </div>

            {/* Preview */}
            <div className="px-5 pb-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <img
                  src={imageUrl}
                  alt="Share preview"
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{title}</p>
                  <p className="text-xs text-muted-foreground truncate">{imageUrl}</p>
                </div>
              </div>
            </div>

            {/* Share Options */}
            <div className="px-5 pb-4 grid grid-cols-4 gap-3">
              {shareOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => handleShare(option.id)}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${option.color}`}>
                    {option.id === "copy" && copied ? (
                      <Check className="h-6 w-6 text-primary" />
                    ) : (
                      <option.icon className="h-6 w-6 text-foreground" />
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {option.id === "copy" && copied ? "Copied!" : option.label}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Native Share Button */}
            {(Capacitor.isNativePlatform() || navigator.share) && (
              <div className="px-5 pb-6">
                <motion.button
                  onClick={handleNativeShare}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
                >
                  More Options
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
