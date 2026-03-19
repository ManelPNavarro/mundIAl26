import { cn } from "@/lib/utils"

interface SkeletonRowsProps {
  count?: number
  columns?: number
  className?: string
}

export function SkeletonRows({
  count = 5,
  columns = 4,
  className,
}: SkeletonRowsProps) {
  return (
    <div className={cn("w-full", className)} role="status" aria-label="Cargando...">
      {Array.from({ length: count }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-3 border-b border-dark-border px-4"
          style={{ height: "56px" }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => {
            // Vary widths for a more natural look
            const widths = ["w-1/4", "w-1/3", "w-1/2", "w-1/5", "w-2/5"]
            const width = widths[(rowIndex + colIndex) % widths.length]
            return (
              <div
                key={colIndex}
                className={cn(
                  "skeleton-shimmer h-4 rounded-md flex-shrink-0",
                  colIndex === 0 ? "flex-1" : width
                )}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
