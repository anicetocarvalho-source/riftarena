import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle, RiftCardDescription } from "@/components/ui/rift-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, ArrowLeft, Settings as SettingsIcon, 
  RefreshCw, User, Bell, Shield, Sparkles, LogOut
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
  const { user, profile, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isResettingOnboarding, setIsResettingOnboarding] = useState(false);

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

      toast.success("Onboarding reiniciado! Redirecionando...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Error resetting onboarding:", error);
      toast.error("Erro ao reiniciar onboarding");
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

  return (
    <div className="min-h-screen bg-background text-foreground">
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
              Voltar
            </Button>

            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <SettingsIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">Configurações</h1>
                <p className="text-sm text-muted-foreground">
                  Gerir as tuas preferências e conta
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Account Section */}
              <RiftCard>
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-primary" />
                    Conta
                  </RiftCardTitle>
                  <RiftCardDescription>
                    Gerir informações da conta e perfil
                  </RiftCardDescription>
                </RiftCardHeader>
                <RiftCardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Editar Perfil</p>
                      <p className="text-sm text-muted-foreground">
                        Alterar avatar, bio, e redes sociais
                      </p>
                    </div>
                    <Button 
                      variant="rift-outline" 
                      size="sm"
                      onClick={() => navigate("/profile/edit")}
                    >
                      Editar
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Ver Perfil Público</p>
                      <p className="text-sm text-muted-foreground">
                        Visualizar como outros te veem
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/player/${user.id}`)}
                    >
                      Ver Perfil
                    </Button>
                  </div>
                </RiftCardContent>
              </RiftCard>

              {/* Onboarding Section */}
              <RiftCard>
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-warning" />
                    Introdução à Plataforma
                  </RiftCardTitle>
                  <RiftCardDescription>
                    Rever o wizard de boas-vindas e funcionalidades
                  </RiftCardDescription>
                </RiftCardHeader>
                <RiftCardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Repetir Onboarding</p>
                      <p className="text-sm text-muted-foreground">
                        Rever a introdução às funcionalidades da plataforma
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
                          Repetir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Repetir Onboarding?</AlertDialogTitle>
                          <AlertDialogDescription>
                            O wizard de introdução será mostrado novamente quando acederes ao Dashboard.
                            Podes sempre saltar se mudares de ideias.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleResetOnboarding}>
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  
                  {profile?.onboarding_completed && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-success">
                      <div className="h-2 w-2 rounded-full bg-success" />
                      Onboarding concluído
                    </div>
                  )}
                </RiftCardContent>
              </RiftCard>

              {/* Notifications Section */}
              <RiftCard>
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="h-5 w-5 text-primary" />
                    Notificações
                  </RiftCardTitle>
                  <RiftCardDescription>
                    Configurar preferências de notificação
                  </RiftCardDescription>
                </RiftCardHeader>
                <RiftCardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notificações por Email</p>
                      <p className="text-sm text-muted-foreground">
                        Receber atualizações sobre torneios e equipas
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Lembretes de Partidas</p>
                      <p className="text-sm text-muted-foreground">
                        Ser notificado antes das partidas começarem
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Convites de Equipa</p>
                      <p className="text-sm text-muted-foreground">
                        Notificações sobre novos convites
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </RiftCardContent>
              </RiftCard>

              {/* Privacy Section */}
              <RiftCard>
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5 text-primary" />
                    Privacidade
                  </RiftCardTitle>
                  <RiftCardDescription>
                    Controlar visibilidade do perfil
                  </RiftCardDescription>
                </RiftCardHeader>
                <RiftCardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Perfil Público</p>
                      <p className="text-sm text-muted-foreground">
                        Permitir que outros vejam o teu perfil
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mostrar Estatísticas</p>
                      <p className="text-sm text-muted-foreground">
                        Exibir ELO e histórico de partidas
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </RiftCardContent>
              </RiftCard>

              {/* Danger Zone */}
              <RiftCard className="border-destructive/50">
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2 text-lg text-destructive">
                    <LogOut className="h-5 w-5" />
                    Sessão
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Terminar Sessão</p>
                      <p className="text-sm text-muted-foreground">
                        Sair da tua conta neste dispositivo
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
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
