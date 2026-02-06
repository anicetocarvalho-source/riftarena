import { Skeleton } from "@/components/ui/skeleton";
import { RiftCard, RiftCardContent, RiftCardHeader } from "@/components/ui/rift-card";

export function DashboardHeaderSkeleton() {
  return (
    <div className="mb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}

export function DashboardCardsSkeleton() {
  return (
    <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <RiftCard key={i}>
          <RiftCardContent className="py-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-sm" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          </RiftCardContent>
        </RiftCard>
      ))}
    </div>
  );
}

export function DashboardQuickStatsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
      {[1, 2, 3, 4].map((i) => (
        <RiftCard key={i}>
          <RiftCardContent className="flex items-center gap-4 py-6">
            <Skeleton className="h-12 w-12 rounded-sm" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </RiftCardContent>
        </RiftCard>
      ))}
    </div>
  );
}

export function DashboardContentSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <RiftCard className="h-full">
          <RiftCardHeader>
            <Skeleton className="h-6 w-40" />
          </RiftCardHeader>
          <RiftCardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-sm">
                  <Skeleton className="h-10 w-10 rounded-sm" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </RiftCardContent>
        </RiftCard>
      </div>
      <RiftCard className="h-full">
        <RiftCardHeader>
          <Skeleton className="h-6 w-32" />
        </RiftCardHeader>
        <RiftCardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </RiftCardContent>
      </RiftCard>
    </div>
  );
}

export function DashboardTeamsSkeleton() {
  return (
    <div className="mt-8">
      <RiftCard>
        <RiftCardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-9 w-28" />
          </div>
        </RiftCardHeader>
        <RiftCardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-sm bg-secondary/30 border border-border">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            ))}
          </div>
        </RiftCardContent>
      </RiftCard>
    </div>
  );
}
