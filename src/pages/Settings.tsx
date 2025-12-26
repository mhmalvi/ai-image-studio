import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Palette, 
  Bell, 
  User, 
  Info, 
  Moon, 
  Sun, 
  Monitor,
  Mail,
  MessageSquare,
  Megaphone,
  Lock,
  Download,
  Trash2,
  FileText,
  Shield,
  HelpCircle,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/ui/glass-card";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { useHaptics } from "@/hooks/useHaptics";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { supabase } from "@/integrations/supabase/client";
import { headerVariants, containerVariants, itemVariants, buttonTapAnimation } from "@/lib/animations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ThemeOption = "light" | "dark" | "system";

// Default notification preferences
const defaultNotifications = {
  push: true,
  email: false,
  marketing: false,
};

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user, signOut } = useAuth();
  const { lightImpact, mediumImpact, warningNotification, successNotification, errorNotification } = useHaptics();
  const { toast } = useToast();
  const { isSupported: pushSupported, isEnabled: pushEnabled, toggleNotifications, isLoading: pushLoading } = usePushNotifications();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Load notification preferences from localStorage
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notificationPreferences");
    return saved ? JSON.parse(saved) : defaultNotifications;
  });

  // Persist notification preferences
  useEffect(() => {
    localStorage.setItem("notificationPreferences", JSON.stringify(notifications));
  }, [notifications]);

  const themeOptions: { value: ThemeOption; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const handleThemeChange = (newTheme: ThemeOption) => {
    lightImpact();
    setTheme(newTheme);
  };

  const handleNotificationChange = async (key: "push" | "email" | "marketing", value: boolean) => {
    lightImpact();
    
    // Special handling for push notifications - actually request permission
    if (key === "push" && pushSupported) {
      const result = await toggleNotifications();
      setNotifications((prev: typeof notifications) => ({ ...prev, push: result }));
      toast({
        title: "Settings updated",
        description: `Push notifications ${result ? "enabled" : "disabled"}`,
      });
      return;
    }
    
    setNotifications((prev: typeof notifications) => ({ ...prev, [key]: value }));
    const keyLabel = key.charAt(0).toUpperCase() + key.slice(1);
    toast({
      title: "Settings updated",
      description: `${keyLabel} notifications ${value ? "enabled" : "disabled"}`,
    });
  };

  const handleExportData = async () => {
    if (!user) return;
    
    setIsExporting(true);
    mediumImpact();
    
    try {
      const { data, error } = await supabase.functions.invoke("export-user-data");
      
      if (error) throw error;
      
      // Create and download the JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `user-data-export-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      successNotification();
      toast({
        title: "Export complete",
        description: "Your data has been downloaded successfully.",
      });
    } catch (error: any) {
      console.error("Export error:", error);
      errorNotification();
      toast({
        title: "Export failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    warningNotification();
    
    try {
      const { data, error } = await supabase.functions.invoke("delete-account");
      
      if (error) throw error;
      
      // Sign out and redirect
      await signOut();
      
      toast({
        title: "Account deleted",
        description: "Your account and all data have been permanently removed.",
      });
      
      navigate("/", { replace: true });
    } catch (error: any) {
      console.error("Delete error:", error);
      errorNotification();
      toast({
        title: "Deletion failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageLayout>
      <PageTransition className="flex flex-col h-full px-4 pt-4 pb-4">
        {/* Header */}
        <motion.div
          variants={headerVariants}
          initial="initial"
          animate="animate"
          className="mb-4 flex items-center gap-3"
        >
          <Link to="/profile">
            <motion.button
              whileTap={buttonTapAnimation}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted"
            >
              <ArrowLeft className="h-4 w-4 text-foreground" />
            </motion.button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-xs text-muted-foreground">
              Customize your experience
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="flex-1 overflow-y-auto space-y-4 scrollbar-hide pb-4"
        >
          {/* Appearance Section */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
            </div>
            <GlassCard variant="subtle" className="p-3">
              <p className="text-xs text-muted-foreground mb-3">Choose your preferred theme</p>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = theme === option.value;
                  return (
                    <motion.button
                      key={option.value}
                      whileTap={buttonTapAnimation}
                      onClick={() => handleThemeChange(option.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                        isActive
                          ? "border-primary bg-primary/10"
                          : "border-border/50 bg-card hover:border-primary/30"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-xs font-medium ${isActive ? "text-primary" : "text-foreground"}`}>
                        {option.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>

          {/* Notifications Section */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
            </div>
            <GlassCard variant="subtle" className="p-0 divide-y divide-border/50">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Get notified about your creations</p>
                  </div>
                </div>
                <Switch
                  checked={pushSupported ? pushEnabled : notifications.push}
                  onCheckedChange={(value) => handleNotificationChange("push", value)}
                  disabled={pushLoading}
                />
              </div>
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                    <Mail className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Weekly digest and updates</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(value) => handleNotificationChange("email", value)}
                />
              </div>
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <Megaphone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Marketing</p>
                    <p className="text-xs text-muted-foreground">New features and promotions</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={(value) => handleNotificationChange("marketing", value)}
                />
              </div>
            </GlassCard>
          </motion.div>

          {/* Account Section */}
          {isAuthenticated && (
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-highlight" />
                <h2 className="text-sm font-semibold text-foreground">Account</h2>
              </div>
              <GlassCard variant="subtle" className="p-0 divide-y divide-border/50">
                <motion.button
                  whileTap={buttonTapAnimation}
                  onClick={() => navigate("/auth/forgot")}
                  className="flex items-center justify-between p-3 w-full"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">Change Password</p>
                      <p className="text-xs text-muted-foreground">Update your password</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </motion.button>
                <motion.button
                  whileTap={buttonTapAnimation}
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="flex items-center justify-between p-3 w-full disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      {isExporting ? (
                        <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">
                        {isExporting ? "Exporting..." : "Export Data"}
                      </p>
                      <p className="text-xs text-muted-foreground">Download all your data</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </motion.button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <motion.button
                      whileTap={buttonTapAnimation}
                      className="flex items-center justify-between p-3 w-full"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-destructive">Delete Account</p>
                          <p className="text-xs text-muted-foreground">Permanently remove your account</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </motion.button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. All your data, images, and subscription will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </GlassCard>
            </motion.div>
          )}

          {/* About Section */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">About</h2>
            </div>
            <GlassCard variant="subtle" className="p-0 divide-y divide-border/50">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Version</p>
                </div>
                <span className="text-sm text-muted-foreground">1.0.0</span>
              </div>
              <Link to="/terms">
                <motion.div
                  whileTap={buttonTapAnimation}
                  className="flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Terms of Service</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </Link>
              <Link to="/privacy">
                <motion.div
                  whileTap={buttonTapAnimation}
                  className="flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Privacy Policy</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </Link>
              <Link to="/support">
                <motion.div
                  whileTap={buttonTapAnimation}
                  className="flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Help & Support</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </Link>
            </GlassCard>
          </motion.div>
        </motion.div>
      </PageTransition>
    </PageLayout>
  );
}
