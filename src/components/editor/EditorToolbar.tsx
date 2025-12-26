import { motion } from "framer-motion";
import { 
  Undo2, Redo2, Crop, RotateCw, SunMedium, Sparkles, Type, Smile, X, Check 
} from "lucide-react";
import { cn } from "@/lib/utils";

export type EditorTool = "crop" | "rotate" | "adjust" | "enhance" | "text" | "sticker";

interface EditorToolbarProps {
  activeTool: EditorTool | null;
  onToolChange: (tool: EditorTool | null) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClose: () => void;
  onSave: () => void;
  isEnhancing?: boolean;
}

const tools = [
  { id: "crop" as EditorTool, icon: Crop, label: "Crop" },
  { id: "rotate" as EditorTool, icon: RotateCw, label: "Rotate" },
  { id: "adjust" as EditorTool, icon: SunMedium, label: "Adjust" },
  { id: "enhance" as EditorTool, icon: Sparkles, label: "AI Enhance" },
  { id: "text" as EditorTool, icon: Type, label: "Text" },
  { id: "sticker" as EditorTool, icon: Smile, label: "Stickers" },
];

export function EditorToolbar({
  activeTool,
  onToolChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClose,
  onSave,
  isEnhancing,
}: EditorToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Header with undo/redo and close/save */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border/50"
          >
            <X className="h-5 w-5 text-foreground" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onUndo}
            disabled={!canUndo}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border/50 transition-opacity",
              !canUndo && "opacity-40"
            )}
          >
            <Undo2 className="h-5 w-5 text-foreground" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onRedo}
            disabled={!canRedo}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border/50 transition-opacity",
              !canRedo && "opacity-40"
            )}
          >
            <Redo2 className="h-5 w-5 text-foreground" />
          </motion.button>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onSave}
          className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary glow-primary"
        >
          <Check className="h-5 w-5 text-primary-foreground" />
        </motion.button>
      </div>

      {/* Tool tabs */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1">
        {tools.map((tool) => (
          <motion.button
            key={tool.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToolChange(activeTool === tool.id ? null : tool.id)}
            disabled={tool.id === "enhance" && isEnhancing}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all min-w-[60px]",
              activeTool === tool.id
                ? "bg-primary/20 border border-primary/50"
                : "bg-card border border-border/50 hover:border-primary/30",
              tool.id === "enhance" && isEnhancing && "animate-pulse"
            )}
          >
            <tool.icon className={cn(
              "h-5 w-5",
              activeTool === tool.id ? "text-primary" : "text-foreground"
            )} />
            <span className={cn(
              "text-[10px] font-medium",
              activeTool === tool.id ? "text-primary" : "text-muted-foreground"
            )}>
              {tool.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
