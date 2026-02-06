import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RiftCard, RiftCardContent, RiftCardHeader } from "@/components/ui/rift-card";

export function TournamentDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-36" />
          </div>

          {/* Banner placeholder */}
          <Skeleton className="w-full h-48 md:h-64 rounded-lg mb-6" />

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded" />
                <Skeleton className="h-9 w-64" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-28 rounded-full" />
              </div>
              <Skeleton className="h-4 w-96 max-w-full" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>

            {/* Registration CTA Card */}
            <RiftCard className="lg:min-w-[300px]">
              <RiftCardContent className="py-6 space-y-4">
                <div className="text-center space-y-2">
                  <Skeleton className="h-8 w-24 mx-auto" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
                <Skeleton className="h-9 w-full rounded" />
                <div className="flex justify-center gap-6">
                  <div className="text-center space-y-1">
                    <Skeleton className="h-5 w-12 mx-auto" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </div>
                  <div className="text-center space-y-1">
                    <Skeleton className="h-5 w-12 mx-auto" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full rounded-sm" />
              </RiftCardContent>
            </RiftCard>
          </div>

          {/* Info Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <RiftCard key={i}>
                <RiftCardContent className="flex items-center gap-4 py-4">
                  <Skeleton className="h-10 w-10 rounded-sm" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </RiftCardContent>
              </RiftCard>
            ))}
          </div>

          {/* Tabs */}
          <div className="space-y-6">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-9 w-28 rounded-md" />
              ))}
            </div>

            {/* Content placeholder */}
            <RiftCard>
              <RiftCardHeader>
                <Skeleton className="h-6 w-32" />
              </RiftCardHeader>
              <RiftCardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-sm bg-secondary/50 border border-border">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              </RiftCardContent>
            </RiftCard>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
