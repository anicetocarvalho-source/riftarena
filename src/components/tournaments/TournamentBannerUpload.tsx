import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImagePlus, X, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface TournamentBannerUploadProps {
  value: string;
  onChange: (url: string) => void;
  tournamentId?: string;
  disabled?: boolean;
}

export function TournamentBannerUpload({ 
  value, 
  onChange, 
  tournamentId,
  disabled = false 
}: TournamentBannerUploadProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: t("tournamentBanner.invalidType"),
        description: t("tournamentBanner.invalidTypeDesc"),
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t("tournamentBanner.tooLarge"),
        description: t("tournamentBanner.tooLargeDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${tournamentId || crypto.randomUUID()}-${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("tournament-banners")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("tournament-banners")
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast({
        title: t("tournamentBanner.uploadSuccess"),
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: t("tournamentBanner.uploadError"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading) return;
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemove = async () => {
    if (value) {
      // Extract file path from URL and delete from storage
      try {
        const urlParts = value.split("/tournament-banners/");
        if (urlParts[1]) {
          await supabase.storage
            .from("tournament-banners")
            .remove([urlParts[1]]);
        }
      } catch (error) {
        console.error("Error removing banner:", error);
      }
    }
    onChange("");
  };

  return (
    <div className="space-y-2">
      <Label>{t("tournamentBanner.label")}</Label>
      <p className="text-xs text-muted-foreground mb-2">
        {t("tournamentBanner.hint")}
      </p>

      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img
            src={value}
            alt="Tournament banner"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {!disabled && (
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative flex flex-col items-center justify-center h-48 rounded-lg border-2 border-dashed transition-all cursor-pointer",
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-secondary/50",
            (disabled || isUploading) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
              <span className="text-sm text-muted-foreground">
                {t("tournamentBanner.uploading")}
              </span>
            </>
          ) : (
            <>
              <ImagePlus className="h-10 w-10 text-muted-foreground mb-3" />
              <span className="text-sm text-muted-foreground text-center px-4">
                {t("tournamentBanner.dropzone")}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {t("tournamentBanner.formats")}
              </span>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
          e.target.value = "";
        }}
        disabled={disabled || isUploading}
      />
    </div>
  );
}
