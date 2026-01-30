import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useEditProfile } from "@/hooks/useEditProfile";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Camera, Save, ArrowLeft, User } from "lucide-react";
import { SiDiscord, SiX, SiTwitch } from "@icons-pack/react-simple-icons";

const EditProfile = () => {
  const { t } = useTranslation();
  const { user, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [twitterUsername, setTwitterUsername] = useState("");
  const [twitchUsername, setTwitchUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const { isLoading, isUploading, uploadAvatar, updateProfile } = useEditProfile(user?.id || "");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setCity(profile.city || "");
      setCountry(profile.country || "");
      setDiscordUsername(profile.discord_username || "");
      setTwitterUsername(profile.twitter_username || "");
      setTwitchUsername(profile.twitch_username || "");
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    
    // Upload to storage
    const url = await uploadAvatar(file);
    if (url) {
      setAvatarUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await updateProfile({
      username: username.trim(),
      bio: bio.trim(),
      city: city.trim(),
      country: country.trim(),
      discord_username: discordUsername.trim() || null,
      twitter_username: twitterUsername.trim() || null,
      twitch_username: twitchUsername.trim() || null,
      avatar_url: avatarUrl,
    });
    
    if (success) {
      navigate(`/player/${user?.id}`);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const displayAvatar = avatarPreview || avatarUrl;

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
              {t('editProfile.back')}
            </Button>

            <RiftCard>
              <RiftCardHeader>
                <RiftCardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {t('editProfile.title')}
                </RiftCardTitle>
              </RiftCardHeader>
              <RiftCardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      <Avatar className="h-24 w-24 border-2 border-primary/20">
                        <AvatarImage src={displayAvatar || undefined} />
                        <AvatarFallback className="text-2xl bg-primary/10">
                          {username.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {isUploading ? (
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        ) : (
                          <Camera className="h-6 w-6 text-white" />
                        )}
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('editProfile.avatarHint')}
                    </p>
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username">{t('editProfile.username')}</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t('editProfile.usernamePlaceholder')}
                      required
                      maxLength={50}
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">{t('editProfile.bio')}</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder={t('editProfile.bioPlaceholder')}
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {bio.length}/500
                    </p>
                  </div>

                  {/* Location */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">{t('editProfile.city')}</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder={t('editProfile.cityPlaceholder')}
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">{t('editProfile.country')}</Label>
                      <Input
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder={t('editProfile.countryPlaceholder')}
                        maxLength={100}
                      />
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="space-y-4">
                    <Label className="text-base">{t('editProfile.socialLinks')}</Label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#5865F2]/10">
                          <SiDiscord className="h-5 w-5 text-[#5865F2]" />
                        </div>
                        <Input
                          placeholder={t('editProfile.discordPlaceholder')}
                          value={discordUsername}
                          onChange={(e) => setDiscordUsername(e.target.value)}
                          maxLength={50}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-foreground/10">
                          <SiX className="h-5 w-5" />
                        </div>
                        <Input
                          placeholder={t('editProfile.twitterPlaceholder')}
                          value={twitterUsername}
                          onChange={(e) => setTwitterUsername(e.target.value)}
                          maxLength={50}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#9146FF]/10">
                          <SiTwitch className="h-5 w-5 text-[#9146FF]" />
                        </div>
                        <Input
                          placeholder={t('editProfile.twitchPlaceholder')}
                          value={twitchUsername}
                          onChange={(e) => setTwitchUsername(e.target.value)}
                          maxLength={50}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="rift-outline"
                      onClick={() => navigate(-1)}
                    >
                      {t('editProfile.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      variant="rift"
                      disabled={isLoading || isUploading || !username.trim()}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      {isLoading ? t('editProfile.saving') : t('editProfile.saveChanges')}
                    </Button>
                  </div>
                </form>
              </RiftCardContent>
            </RiftCard>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditProfile;
