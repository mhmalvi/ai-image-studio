import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  hideNav?: boolean;
}

export function PageLayout({ children, className, hideNav = false }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background gradient-hero">
      <main
        className={cn(
          "safe-top safe-left safe-right pb-24",
          className
        )}
      >
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
