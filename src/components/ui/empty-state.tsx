import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: "rift" | "rift-outline" | "default" | "ghost";
  icon?: LucideIcon;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  tip?: string;
  actions?: EmptyStateAction[];
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  tip,
  actions = [],
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-8" : "py-12",
        className
      )}
    >
      {/* Icon with decorative ring */}
      <div className="relative mb-4">
        <div className={cn(
          "flex items-center justify-center rounded-full bg-secondary/80 border border-border",
          compact ? "h-16 w-16" : "h-20 w-20"
        )}>
          <Icon className={cn(
            "text-muted-foreground/60",
            compact ? "h-8 w-8" : "h-10 w-10"
          )} />
        </div>
        {/* Decorative dots */}
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary/20" />
        <div className="absolute -bottom-1 -left-1 h-2 w-2 rounded-full bg-primary/30" />
      </div>

      {/* Title */}
      <h3 className={cn(
        "font-display font-semibold mb-2",
        compact ? "text-base" : "text-lg"
      )}>
        {title}
      </h3>

      {/* Description */}
      <p className={cn(
        "text-muted-foreground max-w-sm mb-4",
        compact ? "text-sm" : "text-base"
      )}>
        {description}
      </p>

      {/* Tip */}
      {tip && (
        <p className="text-xs text-muted-foreground/70 mb-4 max-w-xs">
          💡 {tip}
        </p>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div className={cn(
          "flex gap-3",
          actions.length > 2 ? "flex-col sm:flex-row" : "flex-row"
        )}>
          {actions.map((action, index) => {
            const ActionIcon = action.icon;
            return (
              <Button
                key={index}
                variant={action.variant || (index === 0 ? "rift" : "rift-outline")}
                size={compact ? "sm" : "default"}
                onClick={action.onClick}
              >
                {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
                {action.label}
              </Button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
