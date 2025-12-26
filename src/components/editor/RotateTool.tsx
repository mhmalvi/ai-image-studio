import { motion } from "framer-motion";
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical } from "lucide-react";

interface RotateToolProps {
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  onRotate: (degrees: number) => void;
  onFlipH: () => void;
  onFlipV: () => void;
}

export function RotateTool({ rotation, flipH, flipV, onRotate, onFlipH, onFlipV }: RotateToolProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-4"
    >
      {/* Rotation controls */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Rotate</p>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onRotate(-90)}
            className="flex items-center justify-center gap-2 rounded-xl border border-border/50 bg-card p-3 transition-all hover:border-primary/30"
          >
            <RotateCcw className="h-5 w-5 text-foreground" />
            <span className="text-sm font-medium text-foreground">90° Left</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onRotate(90)}
            className="flex items-center justify-center gap-2 rounded-xl border border-border/50 bg-card p-3 transition-all hover:border-primary/30"
          >
            <RotateCw className="h-5 w-5 text-foreground" />
            <span className="text-sm font-medium text-foreground">90° Right</span>
          </motion.button>
        </div>
      </div>

      {/* Flip controls */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Flip</p>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onFlipH}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 transition-all ${
              flipH 
                ? "border-primary bg-primary/20" 
                : "border-border/50 bg-card hover:border-primary/30"
            }`}
          >
            <FlipHorizontal className={`h-5 w-5 ${flipH ? "text-primary" : "text-foreground"}`} />
            <span className={`text-sm font-medium ${flipH ? "text-primary" : "text-foreground"}`}>
              Horizontal
            </span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onFlipV}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 transition-all ${
              flipV 
                ? "border-primary bg-primary/20" 
                : "border-border/50 bg-card hover:border-primary/30"
            }`}
          >
            <FlipVertical className={`h-5 w-5 ${flipV ? "text-primary" : "text-foreground"}`} />
            <span className={`text-sm font-medium ${flipV ? "text-primary" : "text-foreground"}`}>
              Vertical
            </span>
          </motion.button>
        </div>
      </div>

      {/* Current rotation display */}
      <div className="flex items-center justify-center gap-2 rounded-xl bg-muted/50 p-3">
        <span className="text-sm text-muted-foreground">Current rotation:</span>
        <span className="text-sm font-medium text-foreground">{rotation}°</span>
      </div>
    </motion.div>
  );
}
