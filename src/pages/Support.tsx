import { motion } from "framer-motion";
import { ArrowLeft, HelpCircle, MessageCircle, Mail, ExternalLink, BookOpen, Bug, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { headerVariants, containerVariants, itemVariants, buttonTapAnimation } from "@/lib/animations";
import { useToast } from "@/hooks/use-toast";
import { useHaptics } from "@/hooks/useHaptics";

const faqItems = [
  {
    question: "How do I generate an image?",
    answer: "Go to the Generate page, enter a text description of what you want to create, select a style, and tap 'Generate'. The AI will create your image in seconds."
  },
  {
    question: "What are Pro features?",
    answer: "Pro unlocks exclusive styles, higher resolution images, priority generation, and removes all limits. You can subscribe monthly or yearly."
  },
  {
    question: "How do I save my images?",
    answer: "Sign in to automatically save all your creations. You can also download images directly to your device using the download button."
  },
  {
    question: "Can I use generated images commercially?",
    answer: "Yes! You own the images you create. Pro users get additional commercial usage rights. Check our Terms of Service for details."
  },
];

const supportOptions = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help within 24 hours",
    action: "support@pixora.app",
    gradient: "from-primary to-accent"
  },
  {
    icon: Bug,
    title: "Report a Bug",
    description: "Help us improve",
    action: "Report",
    gradient: "from-destructive to-orange-500"
  },
  {
    icon: Lightbulb,
    title: "Feature Request",
    description: "Share your ideas",
    action: "Suggest",
    gradient: "from-highlight to-amber-400"
  },
];

export default function Support() {
  const { toast } = useToast();
  const { lightImpact } = useHaptics();

  const handleEmailClick = () => {
    lightImpact();
    window.location.href = "mailto:support@pixora.app";
  };

  const handleReportBug = () => {
    lightImpact();
    toast({
      title: "Report a Bug",
      description: "Email us at bugs@pixora.app with details about the issue.",
    });
  };

  const handleFeatureRequest = () => {
    lightImpact();
    toast({
      title: "Feature Request",
      description: "Email us at feedback@pixora.app with your suggestion!",
    });
  };

  return (
    <PageLayout hideNav>
      <PageTransition className="flex flex-col h-full px-4 pt-4 pb-8">
        {/* Header */}
        <motion.div
          variants={headerVariants}
          initial="initial"
          animate="animate"
          className="mb-6 flex items-center gap-3"
        >
          <Link to="/settings">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </motion.button>
          </Link>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Help & Support</h1>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="flex-1 overflow-y-auto space-y-5 scrollbar-hide"
        >
          {/* Support Options */}
          <motion.div variants={itemVariants}>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              Get Help
            </h2>
            <div className="grid gap-3">
              {supportOptions.map((option, index) => (
                <motion.button
                  key={option.title}
                  whileTap={buttonTapAnimation}
                  onClick={
                    option.title === "Email Support" ? handleEmailClick :
                    option.title === "Report a Bug" ? handleReportBug :
                    handleFeatureRequest
                  }
                  className="w-full text-left"
                >
                  <GlassCard variant="subtle" className="p-4 flex items-center gap-4 group">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${option.gradient}`}>
                      <option.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{option.title}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </GlassCard>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div variants={itemVariants}>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-accent" />
              Frequently Asked Questions
            </h2>
            <GlassCard variant="subtle" className="p-4 space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className={index !== faqItems.length - 1 ? "pb-4 border-b border-border/30" : ""}>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{item.question}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </GlassCard>
          </motion.div>

          {/* Contact CTA */}
          <motion.div variants={itemVariants} className="pt-2">
            <GlassCard variant="elevated" glow="primary" className="p-5 text-center">
              <h3 className="text-base font-bold text-foreground mb-2">Still need help?</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Our support team is here to assist you
              </p>
              <GradientButton
                onClick={handleEmailClick}
                variant="primary"
                size="md"
                className="w-full"
              >
                <Mail className="h-4 w-4" />
                Contact Support
              </GradientButton>
            </GlassCard>
          </motion.div>
        </motion.div>
      </PageTransition>
    </PageLayout>
  );
}
