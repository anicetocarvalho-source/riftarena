import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RiftCard, RiftCardContent, RiftCardHeader } from "@/components/ui/rift-card";

export function PlayerProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Profile Header */}
          <RiftCard glow className="overflow-hidden mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent" />
            <RiftCardContent className="relative">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 py-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-96 max-w-full" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-28 rounded-md" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </div>
                </div>
              </div>
            </RiftCardContent>
          </RiftCard>

          {/* Quick Stats */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <RiftCard key={i}>
                <RiftCardContent className="flex items-center gap-4 py-4">
                  <Skeleton className="h-12 w-12 rounded-sm" />
                  <div className="space-y-2">
                    <Skeleton className="h-7 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </RiftCardContent>
              </RiftCard>
            ))}
          </div>

          {/* Tabs */}
          <div className="space-y-6">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-9 w-24 rounded-md" />
              ))}
            </div>

            {/* Content area */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Chart placeholder */}
              <RiftCard className="lg:col-span-2">
                <RiftCardHeader>
                  <Skeleton className="h-6 w-40" />
                </RiftCardHeader>
                <RiftCardContent>
                  <Skeleton className="h-64 w-full rounded" />
                </RiftCardContent>
              </RiftCard>

              {/* Rankings by Game */}
              <RiftCard>
                <RiftCardHeader>
                  <Skeleton className="h-6 w-36" />
                </RiftCardHeader>
                <RiftCardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-sm bg-secondary/50 border border-border">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <div className="space-y-1.5 text-right">
                          <Skeleton className="h-5 w-12 ml-auto" />
                          <Skeleton className="h-3 w-16 ml-auto" />
                        </div>
                      </div>
                    ))}
                  </div>
                </RiftCardContent>
              </RiftCard>

              {/* Achievements */}
              <RiftCard>
                <RiftCardHeader>
                  <Skeleton className="h-6 w-40" />
                </RiftCardHeader>
                <RiftCardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-sm border border-border">
                        <Skeleton className="h-8 w-8 rounded" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    ))}
                  </div>
                </RiftCardContent>
              </RiftCard>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
