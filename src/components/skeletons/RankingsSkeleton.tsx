import { Skeleton } from "@/components/ui/skeleton";

export function RankingsTableSkeleton() {
  return (
    <div className="rounded-sm border border-border bg-card overflow-hidden">
      {/* Table Header */}
      <div className="hidden sm:flex items-center gap-4 border-b border-border px-4 py-3 bg-secondary/50">
        <div className="w-12 text-center">
          <Skeleton className="h-3 w-8 mx-auto" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="hidden md:block w-24">
          <Skeleton className="h-3 w-10 mx-auto" />
        </div>
        <div className="hidden sm:flex items-center gap-6">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="w-20 flex justify-end">
          <Skeleton className="h-3 w-8" />
        </div>
      </div>

      {/* Skeleton Rows */}
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 px-4 py-3 border-b border-border/50"
        >
          {/* Rank */}
          <div className="w-12 flex justify-center">
            {index < 3 ? (
              <Skeleton className="h-8 w-8 rounded-full" />
            ) : (
              <Skeleton className="h-5 w-5" />
            )}
          </div>

          {/* Player */}
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="min-w-0 space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          {/* Tier */}
          <div className="hidden md:flex items-center justify-center w-24">
            <Skeleton className="h-5 w-16" />
          </div>

          {/* W/L & Win Rate */}
          <div className="hidden sm:flex items-center gap-6">
            <div className="w-20 flex justify-center">
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="w-16 flex justify-center">
              <Skeleton className="h-4 w-10" />
            </div>
          </div>

          {/* ELO */}
          <div className="w-20 flex justify-end">
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}
