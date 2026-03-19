import { cn } from "@/lib/utils"

type StatusVariant =
  | "scheduled"
  | "live"
  | "finished"
  | "admin"
  | "active"
  | "inactive"
  | "user"

const defaultLabels: Record<StatusVariant, string> = {
  scheduled: "PROGRAMADO",
  live: "EN JUEGO",
  finished: "FINALIZADO",
  admin: "ADMIN",
  active: "ACTIVO",
  inactive: "INACTIVO",
  user: "USUARIO",
}

const variantClasses: Record<StatusVariant, string> = {
  scheduled:
    "bg-gray-muted/10 text-gray-muted border border-gray-muted/20",
  live:
    "bg-red-accent text-white border border-red-accent",
  finished:
    "bg-dark-card text-green-primary border border-green-primary",
  admin:
    "bg-gold/20 text-gold border border-gold/30",
  active:
    "bg-green-primary/10 text-green-primary border border-green-primary/20",
  inactive:
    "bg-gray-muted/10 text-gray-muted border border-gray-muted/20",
  user:
    "bg-dark-border text-gray-muted border border-dark-border",
}

interface StatusBadgeProps {
  variant: StatusVariant | string
  label?: string
  className?: string
}

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  const safeVariant = (variant as StatusVariant) in defaultLabels
    ? (variant as StatusVariant)
    : "scheduled"

  const displayLabel = label ?? defaultLabels[safeVariant]
  const classes = variantClasses[safeVariant]
  const isLive = safeVariant === "live"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide",
        classes,
        className
      )}
    >
      {isLive && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full bg-white pulse-dot shrink-0"
          aria-hidden="true"
        />
      )}
      {displayLabel}
    </span>
  )
}
