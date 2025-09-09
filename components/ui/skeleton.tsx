import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-border bg-card/60">
      <div className="border-b border-border bg-muted/10 p-4">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-6" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="flex-1 space-y-2">
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export { Skeleton, TableSkeleton }