import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTeam, useTeamMembers, useTeamInvites, useInviteToTeam, useRemoveTeamMember, useLeaveTeam } from "@/hooks/useTeams";
import { useTeamLogoUpload } from "@/hooks/useTeamLogo";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, Crown, Loader2, UserPlus, 
  X, Mail, LogOut, Camera, Pencil
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { EditTeamDialog } from "@/components/teams/EditTeamDialog";
import { TeamRosterHistory } from "@/components/teams/TeamRosterHistory";

const TeamDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: team, isLoading: teamLoading } = useTeam(id || "");
  const { data: members } = useTeamMembers(id || "");
  const { data: invites } = useTeamInvites(id || "");
  
  const inviteToTeam = useInviteToTeam();
  const removeMember = useRemoveTeamMember();
  const leaveTeam = useLeaveTeam();
  const { uploadLogo, uploading: logoUploading } = useTeamLogoUpload();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteErrors, setInviteErrors] = useState<Record<string, string>>({});

  const inviteSchema = z.object({
    username: z.string().trim()
      .min(1, t('teamDetail.validation.usernameRequired'))
      .min(3, t('teamDetail.validation.usernameMin'))
      .max(50, t('teamDetail.validation.usernameMax')),
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !team) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      return;
    }

    uploadLogo.mutate({ teamId: team.id, file });
  };

  if (teamLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container text-center">
            <h1 className="text-2xl font-bold mb-4">{t('teamDetail.notFound')}</h1>
            <Button variant="rift" onClick={() => navigate("/teams")}>
              {t('teamDetail.browseTeams')}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isCaptain = team.captain_id === user?.id;
  const isMember = members?.some(m => m.user_id === user?.id);
  const canInvite = isCaptain && (members?.length || 0) < team.max_members;

  const handleInvite = () => {
    const result = inviteSchema.safeParse({ username: inviteUsername });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (!errors[field]) errors[field] = err.message;
      });
      setInviteErrors(errors);
      return;
    }

    setInviteErrors({});
    inviteToTeam.mutate(
      { teamId: team.id, username: result.data.username },
      {
        onSuccess: () => {
          setShowInviteDialog(false);
          setInviteUsername("");
          setInviteErrors({});
        }
      }
    );
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm(t('teamDetail.confirmRemove'))) {
      removeMember.mutate({ memberId, teamId: team.id });
    }
  };

  const handleLeaveTeam = () => {
    if (confirm(t('teamDetail.confirmLeave'))) {
      leaveTeam.mutate(team.id, {
        onSuccess: () => navigate("/teams")
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Breadcrumbs */}
          <PageBreadcrumbs 
            items={[
              { label: "Teams", href: "/teams" },
              { label: team.name }
            ]}
            className="mb-6"
          />

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="relative group">
                  <Avatar className="h-20 w-20 rounded-sm">
                    <AvatarImage src={team.logo_url || undefined} className="object-cover" />
                    <AvatarFallback className="rounded-sm bg-primary/20 text-3xl font-bold font-display">
                      {team.tag.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isCaptain && (
                    <>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        disabled={logoUploading}
                        className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm cursor-pointer"
                      >
                        {logoUploading ? (
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        ) : (
                          <Camera className="h-6 w-6 text-primary" />
                        )}
                      </button>
                    </>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="font-display text-3xl font-bold uppercase tracking-wide">
                      {team.name}
                    </h1>
                    <Badge variant="secondary">[{team.tag}]</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Crown className="h-4 w-4 text-warning" />
                    <span>Captain: {team.captain?.username}</span>
                  </div>
                  {team.description && (
                    <p className="text-muted-foreground max-w-xl">{team.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {isCaptain && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowEditDialog(true)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('teamDetail.editTeam')}
                  </Button>
                )}
                {isMember && !isCaptain && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleLeaveTeam}
                    disabled={leaveTeam.isPending}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('teamDetail.leaveTeam')}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Members */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <RiftCard>
                <RiftCardHeader className="flex flex-row items-center justify-between">
                  <RiftCardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {t('teamDetail.members')} ({members?.length || 0}/{team.max_members})
                  </RiftCardTitle>
                  {canInvite && (
                    <Button 
                      variant="rift" 
                      size="sm"
                      onClick={() => setShowInviteDialog(true)}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      {t('teamDetail.invite')}
                    </Button>
                  )}
                </RiftCardHeader>
                <RiftCardContent>
                  <div className="space-y-3">
                    {members?.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.user?.avatar_url || undefined} />
                            <AvatarFallback>
                              {member.user?.username?.charAt(0).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{member.user?.username}</p>
                              {member.role === "captain" && (
                                <Crown className="h-4 w-4 text-warning" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground capitalize">
                              {member.role}
                            </p>
                          </div>
                        </div>
                        {isCaptain && member.role !== "captain" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={removeMember.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </RiftCardContent>
              </RiftCard>
            </motion.div>

            {/* Pending Invites (Captain only) */}
            {isCaptain && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <RiftCard>
                  <RiftCardHeader>
                    <RiftCardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      {t('teamDetail.pendingInvites')}
                    </RiftCardTitle>
                  </RiftCardHeader>
                  <RiftCardContent>
                    {!invites || invites.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        {t('teamDetail.noPendingInvites')}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {invites.map((invite) => (
                          <div
                            key={invite.id}
                            className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={invite.user?.avatar_url || undefined} />
                              <AvatarFallback>
                                {invite.user?.username?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium flex-1">
                              {invite.user?.username}
                            </span>
                            <Badge variant="secondary">{t('teamDetail.pending')}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </RiftCardContent>
                </RiftCard>
              </motion.div>
            )}

            {/* Roster History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3"
            >
              <TeamRosterHistory teamId={id || ""} />
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={(open) => { setShowInviteDialog(open); if (!open) { setInviteUsername(""); setInviteErrors({}); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('teamDetail.invitePlayer')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('teamDetail.username')}</Label>
              <Input
                placeholder={t('teamDetail.usernamePlaceholder')}
                value={inviteUsername}
                onChange={(e) => { setInviteUsername(e.target.value); setInviteErrors(prev => ({ ...prev, username: '' })); }}
                maxLength={50}
              />
              {inviteErrors.username && (
                <p className="text-xs text-destructive">{inviteErrors.username}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowInviteDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              variant="rift" 
              onClick={handleInvite}
              disabled={inviteToTeam.isPending}
            >
              {inviteToTeam.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {t('teamDetail.sendInvite')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      {team && (
        <EditTeamDialog
          team={team}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
    </div>
  );
};

export default TeamDetail;
