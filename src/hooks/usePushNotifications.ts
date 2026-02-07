import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  // Check browser support
  useEffect(() => {
    const supported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
    }
    if (!supported || !user) {
      setIsLoading(false);
    }
  }, [user]);

  // Check existing subscription
  useEffect(() => {
    if (!isSupported || !user) return;

    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription =
          await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error("Error checking push subscription:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [isSupported, user]);

  const subscribe = useCallback(async () => {
    if (!user || !isSupported) return;
    setIsLoading(true);

    try {
      // 1. Request notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        toast.error(t("settings.pushDenied"));
        setIsLoading(false);
        return;
      }

      // 2. Get VAPID public key from edge function
      const { data: vapidData, error: vapidError } =
        await supabase.functions.invoke("setup-push");

      if (vapidError || !vapidData?.publicKey) {
        throw new Error("Failed to get VAPID key");
      }

      // 3. Subscribe to push manager
      const registration = await navigator.serviceWorker.ready;
      const appServerKey = urlBase64ToUint8Array(vapidData.publicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey.buffer as ArrayBuffer,
      });

      // 4. Save subscription to database
      const subJson = subscription.toJSON();
      // Table may not be in generated types yet — use generic client call
      const { error: insertError } = await (supabase as any)
        .from("push_subscriptions")
        .upsert(
          {
            user_id: user.id,
            endpoint: subJson.endpoint!,
            p256dh: subJson.keys!.p256dh!,
            auth: subJson.keys!.auth!,
          },
          { onConflict: "user_id,endpoint" }
        );

      if (insertError) throw insertError;

      setIsSubscribed(true);
      toast.success(t("settings.pushEnabled"));
    } catch (error) {
      console.error("Push subscribe error:", error);
      toast.error(t("settings.pushEnableError"));
    } finally {
      setIsLoading(false);
    }
  }, [user, isSupported, t]);

  const unsubscribe = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription =
        await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();

        // Remove from database
        await (supabase as any)
          .from("push_subscriptions")
          .delete()
          .eq("user_id", user.id)
          .eq("endpoint", endpoint);
      }

      setIsSubscribed(false);
      toast.success(t("settings.pushDisabled"));
    } catch (error) {
      console.error("Push unsubscribe error:", error);
      toast.error(t("settings.pushDisableError"));
    } finally {
      setIsLoading(false);
    }
  }, [user, t]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
  };
};
