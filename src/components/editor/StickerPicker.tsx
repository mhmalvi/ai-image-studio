import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export interface StickerLayer {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
}

const stickerCategories = [
  { id: "smileys", label: "😊", stickers: ["😀", "😂", "🥰", "😎", "🤩", "😇", "🤪", "😏", "🥳", "😴"] },
  { id: "hearts", label: "❤️", stickers: ["❤️", "💜", "💙", "💚", "💛", "🧡", "🖤", "💕", "💖", "💗"] },
  { id: "animals", label: "🐱", stickers: ["🐱", "🐶", "🦊", "🐻", "🐼", "🐨", "🦁", "🐯", "🦄", "🐲"] },
  { id: "food", label: "🍕", stickers: ["🍕", "🍔", "🍟", "🌮", "🍦", "🍩", "🍪", "🧁", "🍰", "☕"] },
  { id: "nature", label: "🌸", stickers: ["🌸", "🌺", "🌻", "🌹", "🌴", "🌈", "⭐", "🌙", "☀️", "🔥"] },
  { id: "objects", label: "💎", stickers: ["💎", "👑", "🎸", "🎨", "📷", "💰", "🎁", "🏆", "🎯", "🚀"] },
];

interface StickerPickerProps {
  stickerLayers: StickerLayer[];
  onStickerLayersChange: (layers: StickerLayer[]) => void;
  selectedStickerId: string | null;
  onSelectSticker: (id: string | null) => void;
}

export function StickerPicker({
  stickerLayers,
  onStickerLayersChange,
  selectedStickerId,
  onSelectSticker,
}: StickerPickerProps) {
  const [activeCategory, setActiveCategory] = useState(stickerCategories[0].id);
  const selectedSticker = stickerLayers.find((s) => s.id === selectedStickerId);
  
  const currentCategory = stickerCategories.find((c) => c.id === activeCategory);

  const handleAddSticker = (emoji: string) => {
    const sticker: StickerLayer = {
      id: `sticker-${Date.now()}`,
      emoji,
      x: 50,
      y: 50,
      size: 48,
    };
    onStickerLayersChange([...stickerLayers, sticker]);
    onSelectSticker(sticker.id);
  };

  const handleUpdateSticker = (updates: Partial<StickerLayer>) => {
    if (!selectedStickerId) return;
    onStickerLayersChange(
      stickerLayers.map((s) =>
        s.id === selectedStickerId ? { ...s, ...updates } : s
      )
    );
  };

  const handleDeleteSticker = () => {
    if (!selectedStickerId) return;
    onStickerLayersChange(stickerLayers.filter((s) => s.id !== selectedStickerId));
    onSelectSticker(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-4"
    >
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {stickerCategories.map((category) => (
          <motion.button
            key={category.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(category.id)}
            className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all ${
              activeCategory === category.id
                ? "bg-primary/20 border border-primary/50"
                : "bg-card border border-border/50"
            }`}
          >
            {category.label}
          </motion.button>
        ))}
      </div>

      {/* Sticker grid */}
      <div className="grid grid-cols-5 gap-2">
        {currentCategory?.stickers.map((emoji) => (
          <motion.button
            key={emoji}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAddSticker(emoji)}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-card border border-border/50 text-2xl hover:border-primary/30 transition-all"
          >
            {emoji}
          </motion.button>
        ))}
      </div>

      {/* Added stickers */}
      {stickerLayers.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Added Stickers</p>
          <div className="flex flex-wrap gap-2">
            {stickerLayers.map((sticker) => (
              <motion.button
                key={sticker.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectSticker(sticker.id === selectedStickerId ? null : sticker.id)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl border transition-all ${
                  sticker.id === selectedStickerId
                    ? "border-primary bg-primary/20"
                    : "border-border/50 bg-card"
                }`}
              >
                {sticker.emoji}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Selected sticker controls */}
      {selectedSticker && (
        <div className="space-y-3 rounded-xl border border-border/50 bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedSticker.emoji}</span>
              <span className="text-sm font-medium text-foreground">Sticker Settings</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleDeleteSticker}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </motion.button>
          </div>

          {/* Size slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Size</span>
              <span className="text-foreground">{selectedSticker.size}px</span>
            </div>
            <Slider
              value={[selectedSticker.size]}
              onValueChange={(v) => handleUpdateSticker({ size: v[0] })}
              min={24}
              max={120}
              step={4}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
