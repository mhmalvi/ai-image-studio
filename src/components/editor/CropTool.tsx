import { motion } from "framer-motion";
import { Square, RectangleHorizontal, RectangleVertical, Circle } from "lucide-react";

export type AspectRatio = "free" | "1:1" | "4:3" | "16:9" | "3:4" | "9:16";

interface CropToolProps {
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onApplyCrop: () => void;
}

const aspectRatios: { id: AspectRatio; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "free", label: "Free", icon: Circle },
  { id: "1:1", label: "1:1", icon: Square },
  { id: "4:3", label: "4:3", icon: RectangleHorizontal },
  { id: "16:9", label: "16:9", icon: RectangleHorizontal },
  { id: "3:4", label: "3:4", icon: RectangleVertical },
  { id: "9:16", label: "9:16", icon: RectangleVertical },
];

export function CropTool({ aspectRatio, onAspectRatioChange, onApplyCrop }: CropToolProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-4"
    >
      <p className="text-sm font-medium text-foreground">Aspect Ratio</p>
      
      <div className="grid grid-cols-3 gap-2">
        {aspectRatios.map((ratio) => (
          <motion.button
            key={ratio.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAspectRatioChange(ratio.id)}
            className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all ${
              aspectRatio === ratio.id
                ? "border-primary bg-primary/10"
                : "border-border/50 bg-card hover:border-primary/30"
            }`}
          >
            <ratio.icon className={`h-5 w-5 ${
              aspectRatio === ratio.id ? "text-primary" : "text-foreground"
            }`} />
            <span className={`text-xs font-medium ${
              aspectRatio === ratio.id ? "text-primary" : "text-muted-foreground"
            }`}>
              {ratio.label}
            </span>
          </motion.button>
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Drag the corners on the image to adjust crop area
      </p>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onApplyCrop}
        className="w-full rounded-xl gradient-primary py-3 text-sm font-medium text-primary-foreground"
      >
        Apply Crop
      </motion.button>
    </motion.div>
  );
}
