import { cn } from "@/lib/utils";
import logoSvg from "@/assets/rift-arena-logo.svg";

interface RiftLogoProps {
  className?: string;
  size?: "sm" | "default" | "lg" | "xl";
  showTagline?: boolean;
}

const sizeClasses = {
  sm: "h-8",
  default: "h-10",
  lg: "h-16",
  xl: "h-24",
};

export function RiftLogo({ className, size = "default", showTagline = false }: RiftLogoProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <img
        src={logoSvg}
        alt="RIFT Arena"
        className={cn(sizeClasses[size], "w-auto")}
      />
      {showTagline && (
        <span className="mt-1 text-xs font-body uppercase tracking-[0.4em] text-muted-foreground">
          Enter the Rift
        </span>
      )}
    </div>
  );
}
