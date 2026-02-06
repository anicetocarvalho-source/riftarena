import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RiftCard, RiftCardContent, RiftCardHeader } from "@/components/ui/rift-card";

export function TeamDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-28" />
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div className="flex items-start gap-4">
              <Skeleton className="h-20 w-20 rounded-sm" />
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-64 max-w-full" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-28" />
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Members */}
            <div className="lg:col-span-2">
              <RiftCard>
                <RiftCardHeader className="flex flex-row items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-9 w-24" />
                </RiftCardHeader>
                <RiftCardContent>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    ))}
                  </div>
                </RiftCardContent>
              </RiftCard>
            </div>

            {/* Invites sidebar */}
            <RiftCard>
              <RiftCardHeader>
                <Skeleton className="h-6 w-36" />
              </RiftCardHeader>
              <RiftCardContent>
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-20 flex-1" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                  ))}
                </div>
              </RiftCardContent>
            </RiftCard>

            {/* Roster History */}
            <div className="lg:col-span-3">
              <RiftCard>
                <RiftCardHeader>
                  <Skeleton className="h-6 w-40" />
                </RiftCardHeader>
                <RiftCardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-sm border border-border">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-5 w-16 rounded-full" />
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
