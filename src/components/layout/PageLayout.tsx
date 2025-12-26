import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  hideNav?: boolean;
  background?: "default" | "mesh" | "particles" | "aurora";
}

export function PageLayout({ 
  children, 
  className, 
  hideNav = false,
  background = "default"
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground variant={background} />
      <main
        className={cn(
          "relative z-10 safe-top safe-left safe-right pb-28",
          className
        )}
      >
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
