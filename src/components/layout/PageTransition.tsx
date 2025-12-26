import { motion } from "framer-motion";
import { ReactNode, forwardRef } from "react";
import { pageVariants } from "@/lib/animations";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export const PageTransition = forwardRef<HTMLDivElement, PageTransitionProps>(
  ({ children, className = "" }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);

PageTransition.displayName = "PageTransition";
