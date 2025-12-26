import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
}

const fonts = [
  { id: "sans", label: "Sans", family: "Inter, sans-serif" },
  { id: "serif", label: "Serif", family: "Georgia, serif" },
  { id: "mono", label: "Mono", family: "JetBrains Mono, monospace" },
  { id: "script", label: "Script", family: "Brush Script MT, cursive" },
  { id: "bold", label: "Bold", family: "Impact, sans-serif" },
];

const colors = [
  "#ffffff", "#000000", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4",
];

interface TextOverlayProps {
  textLayers: TextLayer[];
  onTextLayersChange: (layers: TextLayer[]) => void;
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
}

export function TextOverlay({ 
  textLayers, 
  onTextLayersChange, 
  selectedLayerId, 
  onSelectLayer 
}: TextOverlayProps) {
  const [newText, setNewText] = useState("");
  const selectedLayer = textLayers.find((l) => l.id === selectedLayerId);

  const handleAddText = () => {
    if (!newText.trim()) return;
    
    const layer: TextLayer = {
      id: `text-${Date.now()}`,
      text: newText,
      x: 50,
      y: 50,
      fontSize: 32,
      fontFamily: fonts[0].family,
      color: colors[0],
    };
    
    onTextLayersChange([...textLayers, layer]);
    onSelectLayer(layer.id);
    setNewText("");
  };

  const handleUpdateLayer = (updates: Partial<TextLayer>) => {
    if (!selectedLayerId) return;
    onTextLayersChange(
      textLayers.map((l) =>
        l.id === selectedLayerId ? { ...l, ...updates } : l
      )
    );
  };

  const handleDeleteLayer = () => {
    if (!selectedLayerId) return;
    onTextLayersChange(textLayers.filter((l) => l.id !== selectedLayerId));
    onSelectLayer(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-4"
    >
      {/* Add new text */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Enter text..."
          className="flex-1 rounded-xl border border-border/50 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          onKeyDown={(e) => e.key === "Enter" && handleAddText()}
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleAddText}
          className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary"
        >
          <Plus className="h-5 w-5 text-primary-foreground" />
        </motion.button>
      </div>

      {/* Layer list */}
      {textLayers.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Text Layers</p>
          <div className="flex flex-wrap gap-2">
            {textLayers.map((layer) => (
              <motion.button
                key={layer.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectLayer(layer.id === selectedLayerId ? null : layer.id)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                  layer.id === selectedLayerId
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border/50 bg-card text-foreground"
                }`}
              >
                {layer.text.slice(0, 15)}{layer.text.length > 15 ? "..." : ""}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Selected layer controls */}
      {selectedLayer && (
        <div className="space-y-4 rounded-xl border border-border/50 bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Edit Text</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleDeleteLayer}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </motion.button>
          </div>

          {/* Text input */}
          <input
            type="text"
            value={selectedLayer.text}
            onChange={(e) => handleUpdateLayer({ text: e.target.value })}
            className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {/* Font size */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Size</span>
              <span className="text-foreground">{selectedLayer.fontSize}px</span>
            </div>
            <Slider
              value={[selectedLayer.fontSize]}
              onValueChange={(v) => handleUpdateLayer({ fontSize: v[0] })}
              min={12}
              max={72}
              step={2}
            />
          </div>

          {/* Font family */}
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Font</span>
            <div className="flex flex-wrap gap-2">
              {fonts.map((font) => (
                <button
                  key={font.id}
                  onClick={() => handleUpdateLayer({ fontFamily: font.family })}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                    selectedLayer.fontFamily === font.family
                      ? "border-primary bg-primary/20"
                      : "border-border/50 bg-background"
                  }`}
                  style={{ fontFamily: font.family }}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Color</span>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleUpdateLayer({ color })}
                  className={`h-8 w-8 rounded-lg border-2 transition-all ${
                    selectedLayer.color === color ? "border-primary scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
