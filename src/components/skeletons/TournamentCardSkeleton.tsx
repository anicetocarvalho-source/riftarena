import { Skeleton } from "@/components/ui/skeleton";
import { RiftCard, RiftCardContent, RiftCardHeader } from "@/components/ui/rift-card";

export function TournamentCardSkeleton() {
  return (
    <RiftCard className="overflow-hidden">
      {/* Status badge placeholder */}
      <div className="absolute right-4 top-4">
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>

      <RiftCardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-sm" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-36" />
          </div>
        </div>
      </RiftCardHeader>

      <RiftCardContent className="space-y-4">
        {/* Prize Pool */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* CTA */}
        <Skeleton className="h-10 w-full rounded-sm mt-4" />
      </RiftCardContent>
    </RiftCard>
  );
}

export function TournamentGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <TournamentCardSkeleton key={i} />
      ))}
    </div>
  );
}
