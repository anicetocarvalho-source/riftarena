import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useOnboarding() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!user) {
        setShowOnboarding(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching onboarding status:", error);
          setShowOnboarding(false);
        } else {
          // Show onboarding if not completed (null or false)
          setShowOnboarding(!profile?.onboarding_completed);
        }
      } catch (error) {
        console.error("Error checking onboarding:", error);
        setShowOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkOnboardingStatus();
  }, [user]);

  const completeOnboarding = () => {
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    isLoading,
    completeOnboarding,
    skipOnboarding,
  };
}
