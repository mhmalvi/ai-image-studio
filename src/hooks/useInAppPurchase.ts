import { useState, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// RevenueCat types
interface Package {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    title: string;
    description: string;
    price: number;
    priceString: string;
    currencyCode: string;
  };
}

interface PurchaseResult {
  customerInfo: {
    entitlements: {
      active: Record<string, {
        identifier: string;
        productIdentifier: string;
        expirationDate: string | null;
      }>;
    };
  };
}

export interface InAppPurchaseState {
  isInitialized: boolean;
  isLoading: boolean;
  packages: Package[];
  isPurchasing: boolean;
  error: string | null;
}

const REVENUECAT_API_KEY = ""; // Set via Supabase secrets in production

export function useInAppPurchase() {
  const { user } = useAuth();
  const [state, setState] = useState<InAppPurchaseState>({
    isInitialized: false,
    isLoading: true,
    packages: [],
    isPurchasing: false,
    error: null,
  });

  const isNative = Capacitor.isNativePlatform();

  // Initialize RevenueCat SDK
  const initialize = useCallback(async () => {
    if (!isNative) {
      setState(prev => ({ ...prev, isLoading: false, isInitialized: true }));
      return;
    }

    try {
      // Dynamic import for native platforms only
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      
      await Purchases.configure({
        apiKey: REVENUECAT_API_KEY,
      });

      if (user) {
        await Purchases.logIn({ appUserID: user.id });
      }

      setState(prev => ({ ...prev, isInitialized: true }));
      await fetchPackages();
    } catch (error) {
      console.error("RevenueCat initialization error:", error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: "Failed to initialize purchases" 
      }));
    }
  }, [isNative, user]);

  // Fetch available packages
  const fetchPackages = useCallback(async () => {
    if (!isNative) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      const offerings = await Purchases.getOfferings();
      
      const packages: Package[] = [];
      if (offerings.current?.availablePackages) {
        offerings.current.availablePackages.forEach((pkg: any) => {
          packages.push({
            identifier: pkg.identifier,
            packageType: pkg.packageType,
            product: {
              identifier: pkg.product.identifier,
              title: pkg.product.title,
              description: pkg.product.description,
              price: pkg.product.price,
              priceString: pkg.product.priceString,
              currencyCode: pkg.product.currencyCode,
            },
          });
        });
      }

      setState(prev => ({ ...prev, packages, isLoading: false }));
    } catch (error) {
      console.error("Error fetching packages:", error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: "Failed to load subscription options" 
      }));
    }
  }, [isNative]);

  // Purchase a package
  const purchasePackage = useCallback(async (packageId: string): Promise<boolean> => {
    if (!isNative || !user) {
      return false;
    }

    setState(prev => ({ ...prev, isPurchasing: true, error: null }));

    try {
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      const offerings = await Purchases.getOfferings();
      
      const pkg = offerings.current?.availablePackages.find(
        (p: any) => p.identifier === packageId
      );

      if (!pkg) {
        throw new Error("Package not found");
      }

      const result: PurchaseResult = await Purchases.purchasePackage({ 
        aPackage: pkg 
      });

      // Verify purchase with backend
      await verifyPurchase(result);

      setState(prev => ({ ...prev, isPurchasing: false }));
      return true;
    } catch (error: any) {
      console.error("Purchase error:", error);
      
      // Handle user cancellation
      if (error.code === "PURCHASE_CANCELLED") {
        setState(prev => ({ ...prev, isPurchasing: false }));
        return false;
      }

      setState(prev => ({ 
        ...prev, 
        isPurchasing: false, 
        error: error.message || "Purchase failed" 
      }));
      return false;
    }
  }, [isNative, user]);

  // Verify purchase with backend
  const verifyPurchase = async (purchaseResult: PurchaseResult) => {
    if (!user) return;

    const activeEntitlements = purchaseResult.customerInfo.entitlements.active;
    const entitlementIds = Object.keys(activeEntitlements);
    
    if (entitlementIds.length === 0) return;

    const entitlement = activeEntitlements[entitlementIds[0]];
    
    // Determine plan from entitlement
    let plan: "pro" | "premium" = "pro";
    if (entitlement.identifier.includes("premium")) {
      plan = "premium";
    }

    // Call edge function to verify and update subscription
    await supabase.functions.invoke("verify-purchase", {
      body: {
        userId: user.id,
        productId: entitlement.productIdentifier,
        plan,
        expiresAt: entitlement.expirationDate,
      },
    });
  };

  // Restore purchases
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!isNative) return false;

    setState(prev => ({ ...prev, isPurchasing: true, error: null }));

    try {
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      const customerInfo = await Purchases.restorePurchases();
      
      // Sync with backend
      if (Object.keys(customerInfo.customerInfo.entitlements.active).length > 0) {
        await verifyPurchase(customerInfo);
      }

      setState(prev => ({ ...prev, isPurchasing: false }));
      return Object.keys(customerInfo.customerInfo.entitlements.active).length > 0;
    } catch (error: any) {
      console.error("Restore error:", error);
      setState(prev => ({ 
        ...prev, 
        isPurchasing: false, 
        error: "Failed to restore purchases" 
      }));
      return false;
    }
  }, [isNative]);

  // Get price for a specific product
  const getProductPrice = useCallback((productId: string): string | null => {
    const pkg = state.packages.find(p => p.product.identifier === productId);
    return pkg?.product.priceString || null;
  }, [state.packages]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    ...state,
    isNative,
    purchasePackage,
    restorePurchases,
    getProductPrice,
    refetchPackages: fetchPackages,
  };
}
