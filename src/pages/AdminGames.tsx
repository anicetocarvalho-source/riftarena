import { useEffect, useState } from "react";
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
import { useGames } from "@/hooks/useTournaments";
import { useCreateGame, useUpdateGame, useDeleteGame } from "@/hooks/useGameManagement";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { 
  Shield, Gamepad2, Plus, Pencil, Trash2, Loader2, Search
} from "lucide-react";

interface GameFormData {
  name: string;
  icon: string;
  description: string;
}

const POPULAR_ICONS = ["🎮", "⚔️", "🔫", "⚽", "🏎️", "🎯", "🏀", "🎲", "👾", "🕹️", "🏈", "⛳"];

const AdminGames = () => {
  const { t } = useTranslation();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: games, isLoading } = useGames();
  const createGame = useCreateGame();
  const updateGame = useUpdateGame();
  const deleteGame = useDeleteGame();

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<{ id: string; name: string; icon: string; description: string | null } | null>(null);
  const [formData, setFormData] = useState<GameFormData>({ name: "", icon: "🎮", description: "" });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, authLoading, navigate]);

  const filteredGames = games?.filter(game => 
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    
    await createGame.mutateAsync({
      name: formData.name.trim(),
      icon: formData.icon || "🎮",
      description: formData.description.trim() || undefined,
    });
    
    setFormData({ name: "", icon: "🎮", description: "" });
    setIsCreateOpen(false);
  };

  const handleUpdate = async () => {
    if (!editingGame || !formData.name.trim()) return;
    
    await updateGame.mutateAsync({
      id: editingGame.id,
      name: formData.name.trim(),
      icon: formData.icon || "🎮",
      description: formData.description.trim() || undefined,
    });
    
    setEditingGame(null);
    setFormData({ name: "", icon: "🎮", description: "" });
  };

  const handleDelete = async (id: string) => {
    await deleteGame.mutateAsync(id);
  };

  const openEditDialog = (game: { id: string; name: string; icon: string; description: string | null }) => {
    setEditingGame(game);
    setFormData({
      name: game.name,
      icon: game.icon,
      description: game.description || "",
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="diamond" className="gap-1">
                    <Shield className="h-3 w-3" />
                    {t('admin.badge')}
                  </Badge>
                </div>
                <h1 className="font-display text-4xl font-bold uppercase tracking-wide mb-4">
                  {t('admin.gameManagement')}
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  {t('admin.gameManagementDesc')}
                </p>
              </div>
              
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button variant="rift" className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t('admin.addGame')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t('admin.addNewGame')}</DialogTitle>
                    <DialogDescription>
                      {t('admin.addNewGameDesc')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('admin.gameName')}</Label>
                      <Input
                        id="name"
                        placeholder={t('admin.gameNamePlaceholder')}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('admin.icon')}</Label>
                      <div className="flex gap-2 flex-wrap">
                        {POPULAR_ICONS.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setFormData({ ...formData, icon })}
                            className={`w-10 h-10 text-xl rounded-sm border-2 transition-colors ${
                              formData.icon === icon 
                                ? "border-primary bg-primary/10" 
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                      <Input
                        placeholder={t('admin.customEmoji')}
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">{t('admin.descriptionOptional')}</Label>
                      <Textarea
                        id="description"
                        placeholder={t('admin.descriptionPlaceholder')}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button 
                      variant="rift" 
                      onClick={handleCreate}
                      disabled={!formData.name.trim() || createGame.isPending}
                    >
                      {createGame.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {t('admin.createGame')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t('teams.searchPlaceholder')}
                className="pl-10 bg-secondary border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </motion.div>

          {/* Games Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {filteredGames.length === 0 ? (
              <RiftCard>
                <RiftCardContent className="py-12 text-center">
                  <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? t('admin.noGamesFound') : t('admin.noGamesYet')}
                  </p>
                  {!searchTerm && (
                    <Button variant="rift" onClick={() => setIsCreateOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('admin.addFirstGame')}
                    </Button>
                  )}
                </RiftCardContent>
              </RiftCard>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredGames.map((game) => (
                  <RiftCard key={game.id} className="group">
                    <RiftCardContent className="py-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-secondary text-3xl shrink-0">
                          {game.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-lg font-bold uppercase tracking-wide truncate">
                            {game.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {game.description || t('admin.noDescription')}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {t('admin.added')} {new Date(game.created_at).toLocaleDateString("pt-PT")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                        <Dialog open={editingGame?.id === game.id} onOpenChange={(open) => !open && setEditingGame(null)}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="rift-outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => openEditDialog(game)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              {t('common.edit')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>{t('admin.editGame')}</DialogTitle>
                              <DialogDescription>
                                {t('admin.editGameDesc')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-name">{t('admin.gameName')}</Label>
                                <Input
                                  id="edit-name"
                                  value={formData.name}
                                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>{t('admin.icon')}</Label>
                                <div className="flex gap-2 flex-wrap">
                                  {POPULAR_ICONS.map((icon) => (
                                    <button
                                      key={icon}
                                      type="button"
                                      onClick={() => setFormData({ ...formData, icon })}
                                      className={`w-10 h-10 text-xl rounded-sm border-2 transition-colors ${
                                        formData.icon === icon 
                                          ? "border-primary bg-primary/10" 
                                          : "border-border hover:border-primary/50"
                                      }`}
                                    >
                                      {icon}
                                    </button>
                                  ))}
                                </div>
                                <Input
                                  value={formData.icon}
                                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                  className="mt-2"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-description">{t('createTeam.description')}</Label>
                                <Textarea
                                  id="edit-description"
                                  value={formData.description}
                                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="ghost" onClick={() => setEditingGame(null)}>
                                {t('common.cancel')}
                              </Button>
                              <Button 
                                variant="rift" 
                                onClick={handleUpdate}
                                disabled={!formData.name.trim() || updateGame.isPending}
                              >
                                {updateGame.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                {t('admin.saveChanges')}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('admin.deleteGame')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('admin.deleteGameConfirm')} <strong>{game.name}</strong>? 
                                {t('admin.deleteGameWarning')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(game.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {deleteGame.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                {t('common.delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </RiftCardContent>
                  </RiftCard>
                ))}
              </div>
            )}
          </motion.div>

          {/* Stats */}
          {filteredGames.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <p className="text-sm text-muted-foreground text-center">
                {filteredGames.length} {t('admin.gamesRegistered')}
              </p>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminGames;
