import { cn } from "@/lib/utils"

interface SkeletonMatchCardProps {
  className?: string
}

export function SkeletonMatchCard({ className }: SkeletonMatchCardProps) {
  return (
    <div
      className={cn(
        "w-full rounded-lg bg-dark-card border border-dark-border overflow-hidden",
        className
      )}
      style={{ minHeight: "100px" }}
      role="status"
      aria-label="Cargando partido..."
    >
      <div className="flex items-center justify-between h-full px-4 py-4 gap-4">
        {/* Home team */}
        <div className="flex items-center gap-3 flex-1">
          <div className="skeleton-shimmer w-8 h-8 rounded-full shrink-0" />
          <div className="skeleton-shimmer h-4 rounded-md w-24" />
        </div>

        {/* Score / time area */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="skeleton-shimmer h-3 rounded-md w-16" />
          <div className="skeleton-shimmer h-8 rounded-md w-20" />
          <div className="skeleton-shimmer h-3 rounded-md w-12" />
        </div>

        {/* Away team */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="skeleton-shimmer h-4 rounded-md w-24" />
          <div className="skeleton-shimmer w-8 h-8 rounded-full shrink-0" />
        </div>
      </div>
    </div>
  )
}
