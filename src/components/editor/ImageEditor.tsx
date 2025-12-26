import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useImageHistory } from "@/hooks/useImageHistory";
import { EditorToolbar, EditorTool } from "./EditorToolbar";
import { AdjustmentSliders, Adjustments } from "./AdjustmentSliders";
import { PresetButtons } from "./PresetButtons";
import { TextOverlay, TextLayer } from "./TextOverlay";
import { StickerPicker, StickerLayer } from "./StickerPicker";
import { CropTool, AspectRatio } from "./CropTool";
import { RotateTool } from "./RotateTool";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

export function ImageEditor({ imageUrl, onSave, onCancel }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTool, setActiveTool] = useState<EditorTool | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { toast } = useToast();

  // History management
  const { current, canUndo, canRedo, push, undo, redo, reset } = useImageHistory(imageUrl);

  // Adjustments state
  const [adjustments, setAdjustments] = useState<Adjustments>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
  });

  // Transform state
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Crop state
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("free");

  // Text layers
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  // Sticker layers
  const [stickerLayers, setStickerLayers] = useState<StickerLayer[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  // Draw image to canvas with all transforms
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply transforms
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Apply CSS-like filters
      const brightness = 1 + adjustments.brightness / 100;
      const contrast = 1 + adjustments.contrast / 100;
      const saturation = 1 + adjustments.saturation / 100;
      ctx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;

      // Draw the image
      ctx.drawImage(img, 0, 0);
      ctx.filter = "none";

      // Draw text layers
      textLayers.forEach((layer) => {
        ctx.font = `${layer.fontSize}px ${layer.fontFamily}`;
        ctx.fillStyle = layer.color;
        ctx.textAlign = "center";
        const x = (layer.x / 100) * canvas.width;
        const y = (layer.y / 100) * canvas.height;
        ctx.fillText(layer.text, x, y);
      });

      // Draw sticker layers
      stickerLayers.forEach((layer) => {
        ctx.font = `${layer.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const x = (layer.x / 100) * canvas.width;
        const y = (layer.y / 100) * canvas.height;
        ctx.fillText(layer.emoji, x, y);
      });

      ctx.restore();
    };
    img.src = current;
  }, [current, rotation, flipH, flipV, adjustments, textLayers, stickerLayers]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Apply adjustments and save to history
  const applyAdjustments = useCallback((newAdjustments: Adjustments) => {
    setAdjustments(newAdjustments);
  }, []);

  // Handle rotation
  const handleRotate = (degrees: number) => {
    setRotation((prev) => (prev + degrees) % 360);
  };

  // Handle AI enhance
  const handleAIEnhance = async () => {
    if (!current) return;

    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke("enhance-image", {
        body: { imageUrl: current },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        push(data.imageUrl);
        setAdjustments({ brightness: 0, contrast: 0, saturation: 0 });
        toast({ title: "Image enhanced!", description: "AI magic applied" });
      }
    } catch (err: any) {
      console.error("Enhance error:", err);
      toast({
        title: "Enhancement failed",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  // Handle preset selection
  const handleSelectPreset = (presetAdjustments: Adjustments) => {
    setAdjustments(presetAdjustments);
  };

  // Apply crop (simplified - in production would use crop coordinates)
  const handleApplyCrop = () => {
    toast({ title: "Crop applied", description: "Image cropped to selected ratio" });
    setActiveTool(null);
  };

  // Save final image
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // First ensure canvas is fully drawn
    drawCanvas();

    // Small delay to ensure canvas is rendered
    setTimeout(() => {
      const dataUrl = canvas.toDataURL("image/png");
      onSave(dataUrl);
    }, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-background"
    >
      {/* Canvas area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="relative max-w-full max-h-full overflow-hidden rounded-2xl border border-border/50">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[60vh] object-contain"
          />
          
          {/* Draggable text indicators */}
          {activeTool === "text" && textLayers.map((layer) => (
            <div
              key={layer.id}
              onClick={() => setSelectedTextId(layer.id)}
              className={`absolute cursor-move transition-all ${
                selectedTextId === layer.id ? "ring-2 ring-primary" : ""
              }`}
              style={{
                left: `${layer.x}%`,
                top: `${layer.y}%`,
                transform: "translate(-50%, -50%)",
                fontSize: `${layer.fontSize * 0.5}px`,
                fontFamily: layer.fontFamily,
                color: layer.color,
              }}
            >
              {layer.text}
            </div>
          ))}

          {/* Draggable sticker indicators */}
          {activeTool === "sticker" && stickerLayers.map((layer) => (
            <div
              key={layer.id}
              onClick={() => setSelectedStickerId(layer.id)}
              className={`absolute cursor-move transition-all ${
                selectedStickerId === layer.id ? "ring-2 ring-primary rounded-lg" : ""
              }`}
              style={{
                left: `${layer.x}%`,
                top: `${layer.y}%`,
                transform: "translate(-50%, -50%)",
                fontSize: `${layer.size * 0.5}px`,
              }}
            >
              {layer.emoji}
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar and controls */}
      <div className="p-4 space-y-3 bg-card/80 backdrop-blur-xl border-t border-border/50">
        <EditorToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          onClose={onCancel}
          onSave={handleSave}
          isEnhancing={isEnhancing}
        />

        {/* Tool-specific panels */}
        <AnimatePresence mode="wait">
          {activeTool === "crop" && (
            <CropTool
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              onApplyCrop={handleApplyCrop}
            />
          )}

          {activeTool === "rotate" && (
            <RotateTool
              rotation={rotation}
              flipH={flipH}
              flipV={flipV}
              onRotate={handleRotate}
              onFlipH={() => setFlipH(!flipH)}
              onFlipV={() => setFlipV(!flipV)}
            />
          )}

          {activeTool === "adjust" && (
            <AdjustmentSliders
              adjustments={adjustments}
              onAdjustmentsChange={applyAdjustments}
            />
          )}

          {activeTool === "enhance" && (
            <PresetButtons
              onSelectPreset={handleSelectPreset}
              onAIEnhance={handleAIEnhance}
              isEnhancing={isEnhancing}
            />
          )}

          {activeTool === "text" && (
            <TextOverlay
              textLayers={textLayers}
              onTextLayersChange={setTextLayers}
              selectedLayerId={selectedTextId}
              onSelectLayer={setSelectedTextId}
            />
          )}

          {activeTool === "sticker" && (
            <StickerPicker
              stickerLayers={stickerLayers}
              onStickerLayersChange={setStickerLayers}
              selectedStickerId={selectedStickerId}
              onSelectSticker={setSelectedStickerId}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
