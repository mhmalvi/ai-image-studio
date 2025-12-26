import { Variants, Transition } from "framer-motion";

// Unified spring configuration for all animations
export const springConfig = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 1,
};

// Smooth easing for non-spring animations
export const smoothEasing = [0.25, 0.1, 0.25, 1] as const;

// Standard durations
export const durations = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  pageTransition: 0.4,
};

// Page transition variants - smooth fade + slide
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.pageTransition,
      ease: smoothEasing,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: durations.fast,
      ease: smoothEasing,
    },
  },
};

// Header animation - consistent across all pages
export const headerVariants: Variants = {
  initial: {
    opacity: 0,
    y: -16,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.slow,
      ease: smoothEasing,
    },
  },
};

// Content container with stagger children
export const containerVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// Individual item animation
export const itemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: smoothEasing,
    },
  },
};

// Card entrance animation
export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 16,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: durations.normal,
      ease: smoothEasing,
    },
  },
};

// Scale animation for buttons and interactive elements
export const scaleVariants: Variants = {
  initial: { scale: 1 },
  tap: { scale: 0.96 },
  hover: { scale: 1.02 },
};

// Fade in animation
export const fadeVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: smoothEasing,
    },
  },
};

// Slide in from right (for modals, sheets)
export const slideRightVariants: Variants = {
  initial: {
    x: "100%",
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: smoothEasing,
    },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: {
      duration: durations.fast,
      ease: smoothEasing,
    },
  },
};

// Slide in from bottom (for bottom sheets)
export const slideUpVariants: Variants = {
  initial: {
    y: "100%",
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: smoothEasing,
    },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: {
      duration: durations.fast,
      ease: smoothEasing,
    },
  },
};

// Stagger transition helper
export const staggerTransition = (index: number, baseDelay: number = 0): Transition => ({
  duration: durations.normal,
  ease: smoothEasing,
  delay: baseDelay + index * 0.05,
});

// Image grid stagger
export const gridContainerVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15,
    },
  },
};

export const gridItemVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: smoothEasing,
    },
  },
};

// Button tap animation
export const buttonTapAnimation = {
  scale: 0.96,
  transition: { duration: 0.1 },
};

// Consistent interaction props
export const interactiveProps = {
  whileTap: buttonTapAnimation,
  transition: { duration: durations.fast },
};
