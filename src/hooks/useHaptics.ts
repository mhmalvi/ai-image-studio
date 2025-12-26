import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";
import { useCallback } from "react";

export const useHaptics = () => {
  const isNative = Capacitor.isNativePlatform();

  const lightImpact = useCallback(async () => {
    if (isNative) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (error) {
        console.log("Haptics not available");
      }
    }
  }, [isNative]);

  const mediumImpact = useCallback(async () => {
    if (isNative) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch (error) {
        console.log("Haptics not available");
      }
    }
  }, [isNative]);

  const heavyImpact = useCallback(async () => {
    if (isNative) {
      try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } catch (error) {
        console.log("Haptics not available");
      }
    }
  }, [isNative]);

  const selectionChanged = useCallback(async () => {
    if (isNative) {
      try {
        await Haptics.selectionChanged();
      } catch (error) {
        console.log("Haptics not available");
      }
    }
  }, [isNative]);

  const successNotification = useCallback(async () => {
    if (isNative) {
      try {
        await Haptics.notification({ type: NotificationType.Success });
      } catch (error) {
        console.log("Haptics not available");
      }
    }
  }, [isNative]);

  const errorNotification = useCallback(async () => {
    if (isNative) {
      try {
        await Haptics.notification({ type: NotificationType.Error });
      } catch (error) {
        console.log("Haptics not available");
      }
    }
  }, [isNative]);

  const warningNotification = useCallback(async () => {
    if (isNative) {
      try {
        await Haptics.notification({ type: NotificationType.Warning });
      } catch (error) {
        console.log("Haptics not available");
      }
    }
  }, [isNative]);

  return {
    lightImpact,
    mediumImpact,
    heavyImpact,
    selectionChanged,
    successNotification,
    errorNotification,
    warningNotification,
    isNative,
  };
};
