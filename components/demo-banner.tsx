"use client"

import { cn } from "@/lib/utils"

export function DemoBanner({ className }: { className?: string }) {
  const demo = process.env.NEXT_PUBLIC_DEMO_MODE ?? "true"
  if (demo !== "true") return null
  return (
    <div
      role="note"
      aria-label="Simulation mode banner"
      className={cn("w-full bg-amber-100 text-amber-900 text-center py-2 text-sm", className)}
    >
      SIMULATION MODE — DEMONSTRATION ONLY. No live signalling or TMS access.
    </div>
  )
}
