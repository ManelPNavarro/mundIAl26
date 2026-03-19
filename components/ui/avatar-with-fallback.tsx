"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const AVATAR_COLORS = [
  "#00D46A",
  "#f5a623",
  "#e63946",
  "#3b82f6",
  "#8b5cf6",
  "#f97316",
]

function getColorFromName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-20 h-20 text-xl",
  xl: "w-30 h-30 text-3xl",
}

interface AvatarWithFallbackProps {
  name: string
  avatarUrl?: string | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function AvatarWithFallback({
  name,
  avatarUrl,
  size = "md",
  className,
}: AvatarWithFallbackProps) {
  const color = getColorFromName(name)
  const initials = getInitials(name)
  const sizeClass = sizeClasses[size]

  return (
    <Avatar className={cn(sizeClass, "shrink-0", className)}>
      {avatarUrl ? (
        <AvatarImage src={avatarUrl} alt={name} />
      ) : null}
      <AvatarFallback
        style={{ backgroundColor: color, color: "#000000" }}
        className="font-display font-bold"
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
