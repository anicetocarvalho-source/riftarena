import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateTeam } from "@/hooks/useTeams";
import { ArrowLeft, Users, Loader2 } from "lucide-react";

const CreateTeam = () => {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const createTeam = useCreateTeam();

  const [formData, setFormData] = useState({
    name: "",
    tag: "",
    description: "",
    max_members: 5,
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const team = await createTeam.mutateAsync(formData);
      navigate(`/teams/${team.id}`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container max-w-2xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button 
              variant="ghost" 
              className="mb-4"
              onClick={() => navigate("/teams")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('createTeam.backToTeams')}
            </Button>
            <Badge variant="default" className="mb-4">{t('createTeam.badge')}</Badge>
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide mb-2">
              {t('createTeam.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('createTeam.subtitle')}
            </p>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <RiftCard>
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {t('createTeam.teamInfo')}
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('createTeam.teamName')} *</Label>
                      <Input
                        id="name"
                        placeholder={t('createTeam.teamNamePlaceholder')}
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        maxLength={50}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tag">{t('createTeam.teamTag')} *</Label>
                      <Input
                        id="tag"
                        placeholder={t('createTeam.teamTagPlaceholder')}
                        value={formData.tag}
                        onChange={(e) => handleChange("tag", e.target.value.toUpperCase())}
                        maxLength={5}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('createTeam.teamTagHint')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max_members">{t('createTeam.maxTeamSize')}</Label>
                    <Select
                      value={String(formData.max_members)}
                      onValueChange={(value) => handleChange("max_members", parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[3, 4, 5, 6, 7, 8, 10].map((num) => (
                          <SelectItem key={num} value={String(num)}>
                            {num} {t('createTeam.members')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t('createTeam.description')}</Label>
                    <Textarea
                      id="description"
                      placeholder={t('createTeam.descriptionPlaceholder')}
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      rows={4}
                      maxLength={500}
                    />
                  </div>
                </RiftCardContent>
              </RiftCard>
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-4"
            >
              <Button
                type="button"
                variant="rift-outline"
                onClick={() => navigate("/teams")}
              >
                {t('createTeam.cancel')}
              </Button>
              <Button
                type="submit"
                variant="rift"
                disabled={createTeam.isPending || !formData.name || !formData.tag || formData.tag.length < 2}
              >
                {createTeam.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('createTeam.creating')}
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    {t('createTeam.create')}
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateTeam;
