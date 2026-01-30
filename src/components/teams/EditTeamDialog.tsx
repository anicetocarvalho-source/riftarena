import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { useUpdateTeam } from "@/hooks/useTeams";
import { Team } from "@/types/team";

interface EditTeamDialogProps {
  team: Team;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditTeamDialog = ({ team, open, onOpenChange }: EditTeamDialogProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || "");
  const updateTeam = useUpdateTeam();

  useEffect(() => {
    if (open) {
      setName(team.name);
      setDescription(team.description || "");
    }
  }, [open, team]);

  const handleSave = () => {
    if (!name.trim()) return;
    
    updateTeam.mutate(
      { 
        id: team.id, 
        name: name.trim(),
        description: description.trim() || null 
      },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('teamDetail.editTeamTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">{t('teamDetail.teamName')}</Label>
            <Input
              id="team-name"
              placeholder={t('teamDetail.teamNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-description">{t('teamDetail.description')}</Label>
            <Textarea
              id="team-description"
              placeholder={t('teamDetail.descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/500
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button 
            variant="rift" 
            onClick={handleSave}
            disabled={updateTeam.isPending || !name.trim()}
          >
            {updateTeam.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {t('teamDetail.saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
