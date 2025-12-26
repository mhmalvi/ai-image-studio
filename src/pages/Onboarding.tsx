import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ImageIcon, Users, Crown, ArrowRight, ChevronLeft, Hand } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { useHaptics } from "@/hooks/useHaptics";

const slides = [
  {
    id: 1,
    icon: Sparkles,
    title: "Create AI Images",
    description: "Transform your ideas into stunning visuals with our advanced AI generation",
    gradient: "from-primary to-accent",
    bgGlow: "primary",
  },
  {
    id: 2,
    icon: ImageIcon,
    title: "Transform Photos",
    description: "Apply 12+ artistic AI filters to turn your photos into masterpieces",
    gradient: "from-accent to-highlight",
    bgGlow: "accent",
  },
  {
    id: 3,
    icon: Users,
    title: "Explore & Share",
    description: "Join our creative community. Share your work and get inspired by others",
    gradient: "from-secondary to-primary",
    bgGlow: "secondary",
  },
  {
    id: 4,
    icon: Crown,
    title: "Unlock Pro Features",
    description: "Get exclusive styles, filters, and unlimited creations with Pro",
    gradient: "from-amber-500 to-orange-500",
    bgGlow: "highlight",
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const navigate = useNavigate();
  const { lightImpact, mediumImpact } = useHaptics();

  // Hide swipe hint after first interaction or after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSwipeHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    lightImpact();
    setShowSwipeHint(false);
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    lightImpact();
    setShowSwipeHint(false);
    handleComplete();
  };

  const handleComplete = () => {
    mediumImpact();
    localStorage.setItem("hasSeenOnboarding", "true");
    navigate("/", { replace: true });
  };

  const handleBack = () => {
    lightImpact();
    setShowSwipeHint(false);
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleDotClick = (index: number) => {
    lightImpact();
    setShowSwipeHint(false);
    setCurrentSlide(index);
  };

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-background flex flex-col safe-top safe-bottom overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          key={slide.bgGlow}
          className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-20`}
          style={{
            background: `radial-gradient(circle, hsl(var(--${slide.bgGlow})) 0%, transparent 70%)`,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 z-10">
        {currentSlide > 0 ? (
          <motion.button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-muted-foreground"
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </motion.button>
        ) : (
          <div />
        )}
        <motion.button
          onClick={handleSkip}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          Skip
        </motion.button>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            {/* Icon */}
            <motion.div
              className={`mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br ${slide.gradient} shadow-2xl`}
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            >
              <slide.icon className="h-14 w-14 text-white" />
            </motion.div>

            {/* Title */}
            <motion.h1
              className="mb-4 text-3xl font-bold text-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {slide.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              className="max-w-xs text-base text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {slide.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-8 pb-8 safe-bottom">
        {/* Swipe Hint */}
        <AnimatePresence>
          {showSwipeHint && currentSlide === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center gap-2 mb-4 text-muted-foreground"
            >
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Hand className="h-5 w-5" />
              </motion.div>
              <span className="text-xs">Swipe or tap to continue</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Dots - Larger touch targets */}
        <div className="flex justify-center gap-3 mb-6">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 h-3 bg-primary"
                  : "w-3 h-3 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              whileTap={{ scale: 0.9 }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Next/Get Started Button */}
        <GradientButton
          onClick={handleNext}
          variant="primary"
          size="lg"
          className="w-full btn-shine"
        >
          {currentSlide === slides.length - 1 ? (
            <>
              Get Started
              <Sparkles className="h-5 w-5" />
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </GradientButton>
      </div>
    </div>
  );
}
