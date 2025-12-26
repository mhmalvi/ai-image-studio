import { useState, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PushNotificationState {
  isSupported: boolean;
  isEnabled: boolean;
  token: string | null;
  isLoading: boolean;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isEnabled: false,
    token: null,
    isLoading: false,
  });

  // Check if push notifications are supported
  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    const hasNotificationAPI = "Notification" in window;
    
    setState(prev => ({
      ...prev,
      isSupported: isNative || hasNotificationAPI,
    }));
  }, []);

  // Request permission and get token
  const requestPermission = useCallback(async () => {
    if (!state.isSupported) return false;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      if (Capacitor.isNativePlatform()) {
        // Native platform - use Capacitor Push Notifications
        const { PushNotifications } = await import("@capacitor/push-notifications");
        
        const permResult = await PushNotifications.requestPermissions();
        
        if (permResult.receive === "granted") {
          await PushNotifications.register();
          
          // Listen for registration
          PushNotifications.addListener("registration", async (token) => {
            await saveToken(token.value);
            setState(prev => ({
              ...prev,
              isEnabled: true,
              token: token.value,
              isLoading: false,
            }));
          });

          // Listen for push notifications
          PushNotifications.addListener("pushNotificationReceived", (notification) => {
            toast({
              title: notification.title || "Notification",
              description: notification.body,
            });
          });

          // Listen for notification tap
          PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {
            console.log("Notification action:", notification);
            // Handle deep linking here
          });

          return true;
        }
      } else {
        // Web platform - use Web Push API
        const permission = await Notification.requestPermission();
        
        if (permission === "granted") {
          setState(prev => ({
            ...prev,
            isEnabled: true,
            isLoading: false,
          }));
          return true;
        }
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      console.error("Push notification error:", error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [state.isSupported, toast]);

  // Save token to database
  const saveToken = async (token: string) => {
    if (!user) return;

    try {
      // For now, we'll store in localStorage
      // In production, save to a user_push_tokens table
      localStorage.setItem(`push_token_${user.id}`, token);
    } catch (error) {
      console.error("Failed to save push token:", error);
    }
  };

  // Send a local notification
  const sendLocalNotification = useCallback(async (title: string, body: string) => {
    if (!state.isEnabled) return;

    if (Capacitor.isNativePlatform()) {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 1000) },
          },
        ],
      });
    } else if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  }, [state.isEnabled]);

  // Toggle notifications
  const toggleNotifications = useCallback(async () => {
    if (state.isEnabled) {
      setState(prev => ({ ...prev, isEnabled: false }));
      localStorage.removeItem(`push_enabled_${user?.id}`);
      return false;
    } else {
      const result = await requestPermission();
      if (result && user) {
        localStorage.setItem(`push_enabled_${user.id}`, "true");
      }
      return result;
    }
  }, [state.isEnabled, requestPermission, user]);

  // Check existing permissions on mount
  useEffect(() => {
    const checkExisting = async () => {
      if (!state.isSupported) return;

      if (Capacitor.isNativePlatform()) {
        const { PushNotifications } = await import("@capacitor/push-notifications");
        const result = await PushNotifications.checkPermissions();
        setState(prev => ({
          ...prev,
          isEnabled: result.receive === "granted",
        }));
      } else if ("Notification" in window) {
        setState(prev => ({
          ...prev,
          isEnabled: Notification.permission === "granted",
        }));
      }
    };

    checkExisting();
  }, [state.isSupported]);

  return {
    ...state,
    requestPermission,
    toggleNotifications,
    sendLocalNotification,
  };
}
