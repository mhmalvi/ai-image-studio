import { motion } from "framer-motion";
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/ui/glass-card";
import { headerVariants, containerVariants, itemVariants } from "@/lib/animations";

export default function Terms() {
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
            <FileText className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Terms of Service</h1>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="flex-1 overflow-y-auto space-y-4 scrollbar-hide"
        >
          <motion.div variants={itemVariants}>
            <GlassCard variant="subtle" className="p-5 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Last updated: December 2024</p>
                <h2 className="text-lg font-bold text-foreground mb-2">1. Acceptance of Terms</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  By accessing and using AI Studio, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this app.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">2. Use License</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Permission is granted to use AI Studio for personal, non-commercial purposes. This license does not include: modifying or copying the materials, using for commercial purposes, attempting to decompile or reverse engineer any software, or removing any copyright or proprietary notations.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">3. AI-Generated Content</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You retain ownership of the images you create using our AI tools. However, by using our service, you grant us a license to use generated content for improving our services. You are responsible for ensuring your prompts and generated content do not violate any laws or third-party rights.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">4. Prohibited Uses</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You may not use AI Studio to generate content that is: illegal, harmful, threatening, abusive, harassing, defamatory, obscene, or that infringes on the intellectual property rights of others. We reserve the right to terminate accounts that violate these terms.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">5. Subscriptions & Payments</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pro subscriptions are billed according to the plan you choose. Subscriptions automatically renew unless cancelled. Refunds are handled according to app store policies.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">6. Disclaimer</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AI Studio is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, secure, or error-free. AI-generated content may not always meet your expectations.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">7. Contact</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  For questions about these Terms of Service, please contact us at support@aistudio.app
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      </PageTransition>
    </PageLayout>
  );
}
