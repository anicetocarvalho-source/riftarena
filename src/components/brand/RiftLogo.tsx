import { cn } from "@/lib/utils";

interface RiftLogoProps {
  className?: string;
  size?: "sm" | "default" | "lg" | "xl";
  showTagline?: boolean;
}

const sizeClasses = {
  sm: "text-xl",
  default: "text-2xl",
  lg: "text-4xl",
  xl: "text-6xl",
};

export function RiftLogo({ className, size = "default", showTagline = false }: RiftLogoProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <span
        className={cn(
          "font-display font-black tracking-[0.3em] text-foreground",
          sizeClasses[size]
        )}
      >
        <span className="text-gradient-purple">R</span>IFT
      </span>
      {showTagline && (
        <span className="mt-1 text-xs font-body uppercase tracking-[0.4em] text-muted-foreground">
          Enter the Rift
        </span>
      )}
    </div>
  );
}
