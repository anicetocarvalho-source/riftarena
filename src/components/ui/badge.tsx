import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center font-display text-xs font-semibold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/20 text-primary border border-primary/30 rounded-sm px-2.5 py-0.5",
        secondary: "bg-secondary text-secondary-foreground rounded-sm px-2.5 py-0.5",
        destructive: "bg-destructive/20 text-destructive border border-destructive/30 rounded-sm px-2.5 py-0.5",
        success: "bg-success/20 text-success border border-success/30 rounded-sm px-2.5 py-0.5",
        warning: "bg-warning/20 text-warning border border-warning/30 rounded-sm px-2.5 py-0.5",
        outline: "border border-border text-foreground rounded-sm px-2.5 py-0.5",
        // Game Badges
        live: "bg-destructive text-destructive-foreground animate-pulse rounded-sm px-2.5 py-0.5",
        upcoming: "bg-primary/20 text-primary border border-primary/30 rounded-sm px-2.5 py-0.5",
        completed: "bg-muted text-muted-foreground rounded-sm px-2.5 py-0.5",
        // Rank Badges
        diamond: "rank-diamond text-foreground rounded-sm px-2.5 py-0.5",
        platinum: "rank-platinum text-foreground rounded-sm px-2.5 py-0.5",
        gold: "rank-gold text-foreground rounded-sm px-2.5 py-0.5",
        silver: "rank-silver text-foreground rounded-sm px-2.5 py-0.5",
        bronze: "rank-bronze text-foreground rounded-sm px-2.5 py-0.5",
      },
      size: {
        default: "",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
