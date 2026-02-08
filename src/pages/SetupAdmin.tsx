import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RiftLogo } from "@/components/brand/RiftLogo";
import { Shield, Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const SetupAdmin = () => {
  const { t } = useTranslation();
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

  useEffect(() => {
    checkAdminExists();
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
    if (isAdmin) {
      navigate("/admin/users");
    }
  }, [user, isLoading, isAdmin, navigate]);

  const checkAdminExists = async () => {
    setIsChecking(true);
    
    const { data, error } = await supabase.rpc("get_user_roles", {
      _user_id: "00000000-0000-0000-0000-000000000000",
    });
    
    const { count } = await supabase
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    
    setHasAdmin((count || 0) > 0);
    setIsChecking(false);
  };

  const promoteToAdmin = async () => {
    if (!user) return;
    
    setIsPromoting(true);
    
    const { error } = await supabase.rpc("bootstrap_first_admin", {
      _user_id: user.id,
    });

    if (error) {
      console.error("Error promoting to admin:", error);
      toast.error(error.message || t('setupAdmin.promotedError'));
    } else {
      toast.success(t('setupAdmin.promotedSuccess'));
      window.location.href = "/admin/users";
    }

    setIsPromoting(false);
  };

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-rift opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="rounded-sm border border-border bg-card p-8 text-center">
          <RiftLogo size="lg" showTagline />

          <div className="mt-8 mb-6">
            <Shield className="h-16 w-16 mx-auto text-primary mb-4" />
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
              {t('setupAdmin.title')}
            </h1>
          </div>

          {hasAdmin ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <XCircle className="h-5 w-5 text-destructive" />
                <p>{t('setupAdmin.adminExists')}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('setupAdmin.contactAdmin')}
              </p>
              <Button variant="rift-outline" onClick={() => navigate("/dashboard")}>
                {t('setupAdmin.goToDashboard')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-success">
                <CheckCircle className="h-5 w-5" />
                <p>{t('setupAdmin.noAdminYet')}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('setupAdmin.claimAdmin')}
              </p>
              <div className="p-4 rounded-sm bg-secondary/50 border border-border text-left">
                <p className="text-xs text-muted-foreground mb-2">{t('setupAdmin.abilities')}</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• {t('setupAdmin.manageUsers')}</li>
                  <li>• {t('setupAdmin.assignRoles')}</li>
                  <li>• {t('setupAdmin.overseeTournaments')}</li>
                  <li>• {t('setupAdmin.accessAnalytics')}</li>
                </ul>
              </div>
              <Button
                variant="rift"
                size="lg"
                className="w-full"
                onClick={promoteToAdmin}
                disabled={isPromoting}
              >
                {isPromoting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('setupAdmin.promoting')}
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    {t('setupAdmin.becomeAdmin')}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SetupAdmin;