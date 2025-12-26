import { motion } from "framer-motion";
import { Sun, Contrast, Droplets } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
}

interface AdjustmentSlidersProps {
  adjustments: Adjustments;
  onAdjustmentsChange: (adjustments: Adjustments) => void;
}

export function AdjustmentSliders({ adjustments, onAdjustmentsChange }: AdjustmentSlidersProps) {
  const handleChange = (key: keyof Adjustments, value: number[]) => {
    onAdjustmentsChange({
      ...adjustments,
      [key]: value[0],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="rounded-xl border border-border/50 bg-card p-4 space-y-4"
    >
      {/* Brightness */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-highlight" />
            <span className="text-sm font-medium text-foreground">Brightness</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {adjustments.brightness > 0 ? "+" : ""}{adjustments.brightness}
          </span>
        </div>
        <Slider
          value={[adjustments.brightness]}
          onValueChange={(v) => handleChange("brightness", v)}
          min={-100}
          max={100}
          step={5}
          className="w-full"
        />
      </div>

      {/* Contrast */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Contrast className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Contrast</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {adjustments.contrast > 0 ? "+" : ""}{adjustments.contrast}
          </span>
        </div>
        <Slider
          value={[adjustments.contrast]}
          onValueChange={(v) => handleChange("contrast", v)}
          min={-100}
          max={100}
          step={5}
          className="w-full"
        />
      </div>

      {/* Saturation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-foreground">Saturation</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {adjustments.saturation > 0 ? "+" : ""}{adjustments.saturation}
          </span>
        </div>
        <Slider
          value={[adjustments.saturation]}
          onValueChange={(v) => handleChange("saturation", v)}
          min={-100}
          max={100}
          step={5}
          className="w-full"
        />
      </div>

      {/* Reset button */}
      <button
        onClick={() => onAdjustmentsChange({ brightness: 0, contrast: 0, saturation: 0 })}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Reset to defaults
      </button>
    </motion.div>
  );
}
