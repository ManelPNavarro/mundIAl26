import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  subtitle,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className
      )}
    >
      {icon && (
        <div className="text-gray-muted mb-4 [&>svg]:w-12 [&>svg]:h-12 [&>svg]:mx-auto">
          {icon}
        </div>
      )}

      <h3 className="font-display text-2xl text-white mb-2 tracking-wide">
        {title}
      </h3>

      {subtitle && (
        <p className="text-gray-muted text-sm max-w-sm mb-6">{subtitle}</p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            "mt-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors",
            "bg-green-primary text-black hover:bg-green-dim active:scale-95"
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
