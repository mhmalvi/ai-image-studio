import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { Adjustments } from "./AdjustmentSliders";

interface Preset {
  id: string;
  label: string;
  emoji: string;
  adjustments: Adjustments;
}

const presets: Preset[] = [
  { id: "vivid", label: "Vivid", emoji: "🌈", adjustments: { brightness: 10, contrast: 15, saturation: 25 } },
  { id: "warm", label: "Warm", emoji: "🌅", adjustments: { brightness: 5, contrast: 5, saturation: 15 } },
  { id: "cool", label: "Cool", emoji: "❄️", adjustments: { brightness: 5, contrast: 10, saturation: -10 } },
  { id: "moody", label: "Moody", emoji: "🌙", adjustments: { brightness: -15, contrast: 25, saturation: -15 } },
  { id: "fade", label: "Fade", emoji: "🌫️", adjustments: { brightness: 10, contrast: -20, saturation: -25 } },
  { id: "punch", label: "Punch", emoji: "💥", adjustments: { brightness: 5, contrast: 30, saturation: 20 } },
];

interface PresetButtonsProps {
  onSelectPreset: (adjustments: Adjustments) => void;
  onAIEnhance: () => void;
  isEnhancing?: boolean;
}

export function PresetButtons({ onSelectPreset, onAIEnhance, isEnhancing }: PresetButtonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-3"
    >
      {/* AI Enhance button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onAIEnhance}
        disabled={isEnhancing}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-primary/50 bg-primary/10 p-3 transition-all hover:bg-primary/20 disabled:opacity-50"
      >
        <Sparkles className={`h-5 w-5 text-primary ${isEnhancing ? "animate-spin" : ""}`} />
        <span className="text-sm font-medium text-primary">
          {isEnhancing ? "Enhancing..." : "Auto-Enhance with AI"}
        </span>
      </motion.button>

      {/* Preset grid */}
      <div className="grid grid-cols-3 gap-2">
        {presets.map((preset) => (
          <motion.button
            key={preset.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectPreset(preset.adjustments)}
            className="flex flex-col items-center gap-1 rounded-xl border border-border/50 bg-card p-3 transition-all hover:border-primary/30"
          >
            <span className="text-xl">{preset.emoji}</span>
            <span className="text-xs font-medium text-foreground">{preset.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
