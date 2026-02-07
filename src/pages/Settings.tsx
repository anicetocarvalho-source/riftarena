import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { SEOHead } from "@/components/seo/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle, RiftCardDescription } from "@/components/ui/rift-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Loader2, ArrowLeft, Settings as SettingsIcon, 
  RefreshCw, User, Bell, BellRing, Shield, Sparkles, LogOut
} from "lucide-react";
import { toast } from "sonner";
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

const Settings = () => {
  const { t } = useTranslation();
  const { user, profile, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isResettingOnboarding, setIsResettingOnboarding] = useState(false);
  const { preferences, isLoading: prefsLoading, updatePreference } = useUserPreferences(user?.id);
  const {
    isSupported: pushSupported,
    isSubscribed: pushSubscribed,
    isLoading: pushLoading,
    permission: pushPermission,
    subscribe: subscribePush,
    unsubscribe: unsubscribePush,
  } = usePushNotifications();

  const handleResetOnboarding = async () => {
    if (!user) return;
    
    setIsResettingOnboarding(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          onboarding_completed: false,
          onboarding_step: 0 
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success(t('settings.onboardingReset'));
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Error resetting onboarding:", error);
      toast.error(t('settings.onboardingResetError'));
    } finally {
      setIsResettingOnboarding(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  const PreferenceToggle = ({ label, description, prefKey }: { 
    label: string; 
    description: string; 
    prefKey: keyof typeof preferences;
  }) => (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {prefsLoading ? (
        <Skeleton className="h-6 w-11 rounded-full" />
      ) : (
        <Switch
          checked={preferences[prefKey]}
          onCheckedChange={(checked) => updatePreference(prefKey, checked)}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title="Settings" noIndex />
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('settings.back')}
            </Button>

            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <SettingsIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">{t('settings.title')}</h1>
                <p className="text-sm text-muted-foreground">
                  {t('settings.subtitle')}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Account Section */}
              <RiftCard>
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-primary" />
                    {t('settings.account')}
                  </RiftCardTitle>
                  <RiftCardDescription>
                    {t('settings.accountDesc')}
                  </RiftCardDescription>
                </RiftCardHeader>
                <RiftCardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t('settings.editProfile')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.editProfileDesc')}
                      </p>
                    </div>
                    <Button 
                      variant="rift-outline" 
                      size="sm"
                      onClick={() => navigate("/profile/edit")}
                    >
                      {t('settings.edit')}
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t('settings.viewPublicProfile')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.viewPublicProfileDesc')}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/player/${user.id}`)}
                    >
                      {t('settings.viewProfile')}
                    </Button>
                  </div>
                </RiftCardContent>
              </RiftCard>

              {/* Onboarding Section */}
              <RiftCard>
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-warning" />
                    {t('settings.onboarding')}
                  </RiftCardTitle>
                  <RiftCardDescription>
                    {t('settings.onboardingDesc')}
                  </RiftCardDescription>
                </RiftCardHeader>
                <RiftCardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t('settings.repeatOnboarding')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.repeatOnboardingDesc')}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="rift-outline" 
                          size="sm"
                          disabled={isResettingOnboarding}
                        >
                          {isResettingOnboarding ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                          )}
                          {t('settings.repeat')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('settings.repeatOnboardingConfirm')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('settings.repeatOnboardingMessage')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={handleResetOnboarding}>
                            {t('settings.confirm')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  
                  {profile?.onboarding_completed && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-success">
                      <div className="h-2 w-2 rounded-full bg-success" />
                      {t('settings.onboardingCompleted')}
                    </div>
                  )}
                </RiftCardContent>
              </RiftCard>

              {/* Notifications Section */}
              <RiftCard>
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="h-5 w-5 text-primary" />
                    {t('settings.notifications')}
                  </RiftCardTitle>
                  <RiftCardDescription>
                    {t('settings.notificationsDesc')}
                  </RiftCardDescription>
                </RiftCardHeader>
                <RiftCardContent className="space-y-4">
                  <PreferenceToggle
                    label={t('settings.emailNotifications')}
                    description={t('settings.emailNotificationsDesc')}
                    prefKey="email_notifications"
                  />
                  <Separator />
                  <PreferenceToggle
                    label={t('settings.matchReminders')}
                    description={t('settings.matchRemindersDesc')}
                    prefKey="match_reminders"
                  />
                  <Separator />
                  <PreferenceToggle
                    label={t('settings.teamInvites')}
                    description={t('settings.teamInvitesDesc')}
                    prefKey="team_invites_notifications"
                  />
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <BellRing className="h-4 w-4 text-primary" />
                        <p className="font-medium">{t('settings.pushNotifications')}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('settings.pushNotificationsDesc')}
                      </p>
                      {!pushSupported && (
                        <p className="text-xs text-warning mt-1">{t('settings.pushNotSupported')}</p>
                      )}
                      {pushPermission === 'denied' && (
                        <p className="text-xs text-destructive mt-1">{t('settings.pushDenied')}</p>
                      )}
                    </div>
                    {pushLoading ? (
                      <Skeleton className="h-6 w-11 rounded-full" />
                    ) : (
                      <Switch
                        checked={pushSubscribed}
                        onCheckedChange={(checked) => checked ? subscribePush() : unsubscribePush()}
                        disabled={!pushSupported || pushPermission === 'denied'}
                      />
                    )}
                  </div>
                </RiftCardContent>
              </RiftCard>

              {/* Privacy Section */}
              <RiftCard>
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5 text-primary" />
                    {t('settings.privacy')}
                  </RiftCardTitle>
                  <RiftCardDescription>
                    {t('settings.privacyDesc')}
                  </RiftCardDescription>
                </RiftCardHeader>
                <RiftCardContent className="space-y-4">
                  <PreferenceToggle
                    label={t('settings.publicProfile')}
                    description={t('settings.publicProfileDesc')}
                    prefKey="public_profile"
                  />
                  <Separator />
                  <PreferenceToggle
                    label={t('settings.showStats')}
                    description={t('settings.showStatsDesc')}
                    prefKey="show_stats"
                  />
                </RiftCardContent>
              </RiftCard>

              {/* Danger Zone */}
              <RiftCard className="border-destructive/50">
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2 text-lg text-destructive">
                    <LogOut className="h-5 w-5" />
                    {t('settings.session')}
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t('settings.endSession')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.endSessionDesc')}
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('settings.signOut')}
                    </Button>
                  </div>
                </RiftCardContent>
              </RiftCard>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;
