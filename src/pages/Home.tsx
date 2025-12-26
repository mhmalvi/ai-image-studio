import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, ImageIcon, ArrowRight } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { GradientButton } from "@/components/ui/gradient-button";

export default function Home() {
  return (
    <PageLayout>
      <div className="flex min-h-screen flex-col px-4 pt-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <motion.div
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI Powered</span>
          </motion.div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            <span className="text-gradient-primary">AI Image</span>
            <br />
            <span className="text-foreground">Studio</span>
          </h1>

          <p className="mx-auto max-w-xs text-muted-foreground">
            Create stunning images from text or transform photos with AI-powered filters
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div className="space-y-4">
          {/* Generate Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/generate" className="block">
              <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 transition-all hover:border-primary/50">
                <div className="absolute right-0 top-0 h-32 w-32 gradient-primary opacity-10 blur-3xl transition-opacity group-hover:opacity-20" />
                
                <div className="relative z-10 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
                    <Sparkles className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-foreground">
                      Generate Image
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Create from text prompts
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Filter Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/filter" className="block">
              <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 transition-all hover:border-accent/50">
                <div className="absolute right-0 top-0 h-32 w-32 gradient-accent opacity-10 blur-3xl transition-opacity group-hover:opacity-20" />
                
                <div className="relative z-10 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-accent">
                    <ImageIcon className="h-7 w-7 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-foreground">
                      Apply Filters
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Transform your photos
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Style Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Popular Styles
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {["Artistic", "Photorealistic", "Anime", "Cyberpunk", "Vintage"].map(
              (style, index) => (
                <motion.div
                  key={style}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="shrink-0"
                >
                  <div className="rounded-xl border border-border/50 bg-muted/50 px-4 py-2">
                    <span className="text-sm font-medium text-foreground">
                      {style}
                    </span>
                  </div>
                </motion.div>
              )
            )}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-auto pt-8"
        >
          <Link to="/generate">
            <GradientButton variant="primary" size="lg" className="w-full">
              <Sparkles className="h-5 w-5" />
              Start Creating
            </GradientButton>
          </Link>
        </motion.div>
      </div>
    </PageLayout>
  );
}
