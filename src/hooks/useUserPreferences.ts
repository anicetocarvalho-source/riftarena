import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export interface UserPreferences {
  email_notifications: boolean;
  match_reminders: boolean;
  team_invites_notifications: boolean;
  public_profile: boolean;
  show_stats: boolean;
}

const defaultPreferences: UserPreferences = {
  email_notifications: true,
  match_reminders: true,
  team_invites_notifications: true,
  public_profile: true,
  show_stats: true,
};

export const useUserPreferences = (userId: string | undefined) => {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchPreferences = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("email_notifications, match_reminders, team_invites_notifications, public_profile, show_stats")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching preferences:", error);
      } else if (data) {
        setPreferences({
          email_notifications: data.email_notifications,
          match_reminders: data.match_reminders,
          team_invites_notifications: data.team_invites_notifications,
          public_profile: data.public_profile,
          show_stats: data.show_stats,
        });
      }
      setIsLoading(false);
    };

    fetchPreferences();
  }, [userId]);

  const updatePreference = useCallback(
    async <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      if (!userId) return;

      // Optimistic update
      setPreferences((prev) => ({ ...prev, [key]: value }));

      const { error } = await supabase
        .from("profiles")
        .update({ [key]: value, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) {
        // Revert on failure
        setPreferences((prev) => ({ ...prev, [key]: !value }));
        console.error("Error updating preference:", error);
        toast.error(t("settings.preferenceUpdateError"));
      }
    },
    [userId, t]
  );

  return { preferences, isLoading, updatePreference };
};
