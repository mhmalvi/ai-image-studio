import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ImageIcon, ArrowRight, Zap, Palette, Share2 } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { GradientButton } from "@/components/ui/gradient-button";
import { GlassCard } from "@/components/ui/glass-card";

const styles = [
  { id: "artistic", name: "Artistic", gradient: "from-purple-500 to-pink-500" },
  { id: "photorealistic", name: "Photorealistic", gradient: "from-blue-500 to-cyan-500" },
  { id: "anime", name: "Anime", gradient: "from-pink-500 to-orange-400" },
  { id: "cyberpunk", name: "Cyberpunk", gradient: "from-cyan-400 to-purple-600" },
  { id: "vintage", name: "Vintage", gradient: "from-amber-500 to-orange-600" },
  { id: "fantasy", name: "Fantasy", gradient: "from-emerald-400 to-teal-600" },
  { id: "watercolor", name: "Watercolor", gradient: "from-sky-400 to-indigo-500" },
  { id: "oil-painting", name: "Oil Painting", gradient: "from-rose-500 to-red-600" },
  { id: "sketch", name: "Sketch", gradient: "from-slate-400 to-zinc-600" },
  { id: "pop-art", name: "Pop Art", gradient: "from-yellow-400 to-pink-500" },
  { id: "noir", name: "Film Noir", gradient: "from-gray-600 to-gray-900" },
  { id: "dreamy", name: "Dreamy", gradient: "from-violet-400 to-purple-500" },
];

const features = [
  { icon: Zap, label: "Fast Generation", description: "Create in seconds" },
  { icon: Palette, label: "12+ Filters", description: "Transform photos" },
  { icon: Share2, label: "Share & Explore", description: "Join community" },
];

export default function Home() {
  const navigate = useNavigate();

  const handleStyleClick = (styleId: string) => {
    navigate(`/generate?style=${styleId}`);
  };

  return (
    <PageLayout>
      <div className="flex min-h-screen flex-col px-5 pt-10 pb-28">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <motion.div
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 backdrop-blur-sm"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">AI Powered</span>
          </motion.div>

          <h1 className="mb-5 text-5xl font-bold tracking-tight leading-tight">
            <span className="text-gradient-primary">AI Image</span>
            <br />
            <span className="text-foreground">Studio</span>
          </h1>

          <p className="mx-auto max-w-sm text-base text-muted-foreground leading-relaxed">
            Create stunning images from text or transform photos with AI-powered filters
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div className="space-y-4 mb-8">
          {/* Generate Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/generate" className="block">
              <GlassCard
                variant="elevated"
                glow="primary"
                className="relative overflow-hidden p-0"
              >
                <div className="absolute inset-0 gradient-primary opacity-5" />
                <div className="relative z-10 flex items-center gap-5 p-6">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                    className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg"
                  >
                    <Sparkles className="h-8 w-8 text-primary-foreground" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="mb-1.5 text-xl font-bold text-foreground">
                      Generate Image
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Create from text prompts
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </GlassCard>
            </Link>
          </motion.div>

          {/* Filter Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/filter" className="block">
              <GlassCard
                variant="elevated"
                glow="accent"
                className="relative overflow-hidden p-0"
              >
                <div className="absolute inset-0 gradient-accent opacity-5" />
                <div className="relative z-10 flex items-center gap-5 p-6">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                    className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-accent shadow-lg"
                  >
                    <ImageIcon className="h-8 w-8 text-accent-foreground" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="mb-1.5 text-xl font-bold text-foreground">
                      Apply Filters
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Transform your photos
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <ArrowRight className="h-5 w-5 text-accent" />
                  </div>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        </div>

        {/* Features Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8 grid grid-cols-3 gap-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex flex-col items-center rounded-2xl border border-border/30 bg-card/40 p-4 text-center backdrop-blur-sm"
            >
              <feature.icon className="mb-2 h-6 w-6 text-primary" />
              <span className="text-xs font-semibold text-foreground">{feature.label}</span>
              <span className="text-[10px] text-muted-foreground">{feature.description}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Style Examples - Clickable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="mb-4 text-lg font-bold text-foreground">
            Popular Styles
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
            {styles.map((style, index) => (
              <motion.button
                key={style.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 + index * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStyleClick(style.id)}
                className="shrink-0"
              >
                <div className={`rounded-2xl bg-gradient-to-r ${style.gradient} p-[1px]`}>
                  <div className="rounded-2xl bg-card/90 px-5 py-3 backdrop-blur-sm">
                    <span className="text-sm font-semibold text-foreground">
                      {style.name}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* CTA - Fixed position issue with pb-28 above */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-auto"
        >
          <Link to="/generate">
            <GradientButton variant="primary" size="lg" className="w-full btn-shine">
              <Sparkles className="h-5 w-5" />
              Start Creating
            </GradientButton>
          </Link>
        </motion.div>
      </div>
    </PageLayout>
  );
}
