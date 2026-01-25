import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RiftLogo } from "@/components/brand/RiftLogo";
import { Shield, Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const SetupAdmin = () => {
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
    
    // Check if any admin exists by calling the RPC
    const { data, error } = await supabase.rpc("get_user_roles", {
      _user_id: "00000000-0000-0000-0000-000000000000", // Dummy ID to trigger function
    });
    
    // Actually, let's check via a different approach - count admins via profiles
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
      toast.error(error.message || "Failed to promote to admin");
    } else {
      toast.success("You are now an admin!");
      // Refresh auth state
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
              Admin Setup
            </h1>
          </div>

          {hasAdmin ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <XCircle className="h-5 w-5 text-destructive" />
                <p>An admin already exists on this platform.</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Contact an existing admin to be granted admin privileges.
              </p>
              <Button variant="rift-outline" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-success">
                <CheckCircle className="h-5 w-5" />
                <p>No admin exists yet!</p>
              </div>
              <p className="text-sm text-muted-foreground">
                As the first user, you can claim the admin role to manage the platform.
              </p>
              <div className="p-4 rounded-sm bg-secondary/50 border border-border text-left">
                <p className="text-xs text-muted-foreground mb-2">You will be able to:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Manage all platform users</li>
                  <li>• Assign roles (Organizer, Sponsor, Admin)</li>
                  <li>• Oversee all tournaments</li>
                  <li>• Access platform analytics</li>
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
                    Promoting...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Become Admin
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
