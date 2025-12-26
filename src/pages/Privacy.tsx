import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/ui/glass-card";
import { headerVariants, containerVariants, itemVariants } from "@/lib/animations";

export default function Privacy() {
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
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Privacy Policy</h1>
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
                <h2 className="text-lg font-bold text-foreground mb-2">1. Information We Collect</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We collect information you provide directly: account information (email, password), content you create (images, prompts), and usage data. We also collect device information and analytics data to improve our service.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">2. How We Use Your Information</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use your information to: provide and maintain our services, improve and personalize your experience, communicate with you about updates and promotions (with your consent), and ensure the security of our platform.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">3. Data Storage & Security</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your data is stored securely on encrypted servers. We implement industry-standard security measures to protect your information. Images you create are stored in secure cloud storage with access controls.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">4. Sharing Your Information</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We do not sell your personal information. We may share data with: service providers who assist in operating our app, when required by law, or with your explicit consent. Public images are visible to other users.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">5. Your Rights</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You have the right to: access your personal data, correct inaccurate data, request deletion of your data, export your data, and opt-out of marketing communications. Contact us to exercise these rights.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">6. Cookies & Tracking</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns, and deliver personalized content. You can manage cookie preferences through your device settings.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">7. Children's Privacy</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pixora is not intended for children under 13. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">8. Contact Us</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  For privacy-related questions or to exercise your rights, contact us at privacy@pixora.app
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      </PageTransition>
    </PageLayout>
  );
}
