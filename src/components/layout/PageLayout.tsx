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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <AnimatedBackground variant={background} />
      <main
        className={cn(
          "relative z-10 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide safe-top safe-left safe-right",
          className
        )}
      >
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
