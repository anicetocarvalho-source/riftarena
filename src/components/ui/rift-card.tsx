import * as React from "react";
import { cn } from "@/lib/utils";

interface RiftCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  hover?: boolean;
  glass?: boolean;
}

const RiftCard = React.forwardRef<HTMLDivElement, RiftCardProps>(
  ({ className, glow = false, hover = true, glass = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-sm border border-border bg-card p-6",
        hover && "transition-all duration-300 hover:border-primary/30 hover:bg-card/80",
        glow && "rift-border-glow",
        glass && "rift-glass",
        className
      )}
      {...props}
    />
  )
);
RiftCard.displayName = "RiftCard";

const RiftCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));
RiftCardHeader.displayName = "RiftCardHeader";

const RiftCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-display text-lg font-semibold uppercase tracking-wide", className)}
    {...props}
  />
));
RiftCardTitle.displayName = "RiftCardTitle";

const RiftCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
RiftCardDescription.displayName = "RiftCardDescription";

const RiftCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
RiftCardContent.displayName = "RiftCardContent";

const RiftCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));
RiftCardFooter.displayName = "RiftCardFooter";

export { RiftCard, RiftCardHeader, RiftCardTitle, RiftCardDescription, RiftCardContent, RiftCardFooter };
