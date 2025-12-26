import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ImageIcon, ArrowRight, Zap, Palette, Share2, Star, TrendingUp } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { GradientButton } from "@/components/ui/gradient-button";
import { GlassCard } from "@/components/ui/glass-card";
import { useHaptics } from "@/hooks/useHaptics";
import { headerVariants, containerVariants, itemVariants, buttonTapAnimation } from "@/lib/animations";
import { useRef, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const styles = [
  { id: "artistic", name: "Artistic", gradient: "from-purple-500 to-pink-500", emoji: "🎨" },
  { id: "photorealistic", name: "Photorealistic", gradient: "from-blue-500 to-cyan-500", emoji: "📷" },
  { id: "anime", name: "Anime", gradient: "from-pink-500 to-orange-400", emoji: "✨" },
  { id: "cyberpunk", name: "Cyberpunk", gradient: "from-cyan-400 to-purple-600", emoji: "🌆" },
  { id: "vintage", name: "Vintage", gradient: "from-amber-500 to-orange-600", emoji: "📸" },
  { id: "fantasy", name: "Fantasy", gradient: "from-emerald-400 to-teal-600", emoji: "🧙" },
  { id: "watercolor", name: "Watercolor", gradient: "from-sky-400 to-indigo-500", emoji: "💧" },
  { id: "oil-painting", name: "Oil Painting", gradient: "from-rose-500 to-red-600", emoji: "🖼️" },
  { id: "sketch", name: "Sketch", gradient: "from-slate-400 to-zinc-600", emoji: "✏️" },
  { id: "pop-art", name: "Pop Art", gradient: "from-yellow-400 to-pink-500", emoji: "🎭" },
  { id: "noir", name: "Film Noir", gradient: "from-gray-600 to-gray-900", emoji: "🎬" },
  { id: "dreamy", name: "Dreamy", gradient: "from-violet-400 to-purple-500", emoji: "💜" },
];

const features = [
  { icon: Zap, label: "Fast", description: "Seconds", gradient: "from-primary to-accent" },
  { icon: Palette, label: "12+ Filters", description: "Styles", gradient: "from-accent to-highlight" },
  { icon: Share2, label: "Share", description: "Community", gradient: "from-secondary to-primary" },
];

export default function Home() {
  const navigate = useNavigate();
  const { lightImpact, mediumImpact } = useHaptics();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Dynamic stats from database
  const [stats, setStats] = useState([
    { value: "10K+", label: "Creations" },
    { value: "12+", label: "AI Styles" },
    { value: "4.9", label: "Rating", icon: Star },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count } = await supabase
          .from("generated_images")
          .select("*", { count: "exact", head: true })
          .eq("is_public", true);
        
        if (count !== null) {
          const formattedCount = count >= 1000 
            ? `${Math.floor(count / 1000)}K+` 
            : count >= 100 
              ? `${count}+`
              : `${count}`;
          
          setStats([
            { value: formattedCount, label: "Creations" },
            { value: "12+", label: "AI Styles" },
            { value: "4.9", label: "Rating", icon: Star },
          ]);
        }
      } catch (error) {
        console.log("Stats fetch error:", error);
      }
    };
    
    fetchStats();
  }, []);

  const handleStyleClick = (styleId: string) => {
    lightImpact();
    navigate(`/generate?style=${styleId}`);
  };

  const handleCreateClick = () => {
    mediumImpact();
    navigate("/generate");
  };

  return (
    <PageLayout background="mesh">
      <PageTransition className="flex flex-col px-5 pt-6 pb-4 overflow-hidden">
        {/* Hero Section */}
        <motion.div
          variants={headerVariants}
          initial="initial"
          animate="animate"
          className="mb-6 text-center relative"
        >
          {/* Floating orbs background */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <motion.div
              className="absolute top-0 left-1/4 w-32 h-32 rounded-full bg-primary/20 blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1], 
                opacity: [0.3, 0.5, 0.3],
                x: [0, 20, 0],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-10 right-1/4 w-24 h-24 rounded-full bg-accent/20 blur-3xl"
              animate={{ 
                scale: [1.2, 1, 1.2], 
                opacity: [0.4, 0.6, 0.4],
                x: [0, -15, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>

          {/* AI Badge */}
          <motion.div
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 backdrop-blur-sm"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">AI Powered Studio</span>
          </motion.div>

          {/* Main Title */}
          <h1 className="mb-3 text-4xl font-bold tracking-tight leading-tight">
            <span className="text-gradient-primary">Create Magic</span>
            <br />
            <span className="text-foreground">In Seconds</span>
          </h1>

          <p className="mx-auto max-w-xs text-sm text-muted-foreground leading-relaxed mb-5">
            Transform ideas into stunning AI art or apply magical filters to your photos
          </p>

          {/* Primary CTA */}
          <motion.div
            whileTap={buttonTapAnimation}
            className="inline-block"
          >
            <GradientButton
              onClick={handleCreateClick}
              variant="primary"
              size="lg"
              className="btn-shine shadow-xl shadow-primary/30"
            >
              <Sparkles className="h-5 w-5" />
              Start Creating Free
            </GradientButton>
          </motion.div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="mb-5 flex justify-center gap-6"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-1">
                <span className="text-xl font-bold text-foreground">{stat.value}</span>
                {stat.icon && <stat.icon className="h-4 w-4 text-highlight fill-highlight" />}
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={containerVariants} initial="initial" animate="animate" className="space-y-3 mb-5">
          <motion.div variants={itemVariants}>
            <Link to="/generate" className="block">
              <GlassCard variant="elevated" glow="primary" className="relative overflow-hidden p-0 group">
                <div className="absolute inset-0 gradient-primary opacity-5 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 flex items-center gap-4 p-4">
                  <motion.div 
                    className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Sparkles className="h-7 w-7 text-primary-foreground" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="mb-0.5 text-lg font-bold text-foreground">Generate Image</h3>
                    <p className="text-xs text-muted-foreground">Create from text prompts</p>
                  </div>
                  <motion.div 
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors"
                    whileHover={{ x: 3 }}
                  >
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </motion.div>
                </div>
              </GlassCard>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link to="/filter" className="block">
              <GlassCard variant="elevated" glow="accent" className="relative overflow-hidden p-0 group">
                <div className="absolute inset-0 gradient-accent opacity-5 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 flex items-center gap-4 p-4">
                  <motion.div 
                    className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-accent shadow-lg"
                    whileHover={{ scale: 1.05, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <ImageIcon className="h-7 w-7 text-accent-foreground" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="mb-0.5 text-lg font-bold text-foreground">Apply Filters</h3>
                    <p className="text-xs text-muted-foreground">Transform your photos</p>
                  </div>
                  <motion.div 
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors"
                    whileHover={{ x: 3 }}
                  >
                    <ArrowRight className="h-5 w-5 text-accent" />
                  </motion.div>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Row */}
        <motion.div variants={containerVariants} initial="initial" animate="animate" className="mb-5 grid grid-cols-3 gap-2">
          {features.map((feature, i) => (
            <motion.div
              key={feature.label}
              variants={itemVariants}
              className="relative flex flex-col items-center rounded-2xl border border-border/30 bg-card/60 p-3 text-center backdrop-blur-sm overflow-hidden group"
              whileHover={{ y: -2 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
              <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}>
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-foreground">{feature.label}</span>
              <span className="text-[10px] text-muted-foreground">{feature.description}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Popular Styles - Horizontal Scroll */}
        <motion.div variants={itemVariants} initial="initial" animate="animate" className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground">Popular Styles</h2>
            <Link to="/generate" className="text-xs text-primary font-medium flex items-center gap-1">
              See all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          {/* Smooth horizontal scroll container */}
          <div 
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide snap-x snap-mandatory touch-pan-x"
            style={{ 
              WebkitOverflowScrolling: "touch",
              scrollBehavior: "smooth",
            }}
          >
            {styles.map((style, index) => (
              <motion.button
                key={style.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStyleClick(style.id)}
                className="shrink-0 snap-start"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className={`rounded-2xl bg-gradient-to-br ${style.gradient} p-[2px] shadow-lg`}>
                  <div className="flex items-center gap-2 rounded-2xl bg-card/95 backdrop-blur-sm px-4 py-3 min-w-[120px]">
                    <span className="text-xl">{style.emoji}</span>
                    <span className="text-sm font-semibold text-foreground whitespace-nowrap">{style.name}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Trending Banner */}
        <motion.div 
          variants={itemVariants} 
          initial="initial" 
          animate="animate"
          className="mb-4"
        >
          <Link to="/explore">
            <GlassCard variant="subtle" className="relative overflow-hidden p-3 group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-primary/10" />
              <div className="relative flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/20">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Explore Trending</p>
                  <p className="text-[10px] text-muted-foreground">See what the community is creating</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </div>
            </GlassCard>
          </Link>
        </motion.div>
      </PageTransition>
    </PageLayout>
  );
}
