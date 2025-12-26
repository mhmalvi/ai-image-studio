import { useState, useRef, useCallback, ReactNode } from "react";
import { motion, useAnimation } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useHaptics } from "@/hooks/useHaptics";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
}

export const PullToRefresh = ({
  onRefresh,
  children,
  className = "",
}: PullToRefreshProps) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const { mediumImpact, successNotification } = useHaptics();

  const threshold = 80;
  const maxPull = 120;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPulling || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      if (diff > 0 && containerRef.current?.scrollTop === 0) {
        const distance = Math.min(diff * 0.5, maxPull);
        setPullDistance(distance);

        if (distance >= threshold) {
          mediumImpact();
        }
      }
    },
    [isPulling, isRefreshing, mediumImpact]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    setIsPulling(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      controls.start({ rotate: 360, transition: { duration: 1, repeat: Infinity, ease: "linear" } });

      try {
        await onRefresh();
        successNotification();
      } catch (error) {
        console.error("Refresh failed:", error);
      } finally {
        setIsRefreshing(false);
        controls.stop();
        controls.set({ rotate: 0 });
      }
    }

    setPullDistance(0);
  }, [isPulling, pullDistance, isRefreshing, onRefresh, controls, successNotification]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const showIndicator = pullDistance > 10 || isRefreshing;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-50 flex items-center justify-center"
        style={{
          top: Math.max(pullDistance - 40, 8),
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: showIndicator ? 1 : 0,
          scale: showIndicator ? 1 : 0.5,
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-10 h-10 bg-background/90 backdrop-blur-sm rounded-full shadow-lg border border-border flex items-center justify-center">
          <motion.div
            animate={controls}
            style={{ rotate: pullProgress * 180 }}
          >
            <RefreshCw
              className={`w-5 h-5 ${
                pullProgress >= 1 || isRefreshing
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{
          transform: `translateY(${isRefreshing ? 50 : pullDistance * 0.3}px)`,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
};
