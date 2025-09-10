"use client"

import { KPIGrid } from "@/components/kpis"
import LiveMap from "@/components/map"
import { DemoBanner } from "@/components/demo-banner"
import { ActivityLog } from "@/components/activity-log"
import { ConflictStrip } from "@/components/conflict-strip"
import { RecommendationCard } from "@/components/recommendation-card"
import { TrainControlPanel } from "@/components/train-control-panel"
import { LiveMetrics } from "@/components/live-metrics"
import { Button } from "@/components/ui/button"
import { useSimWS } from "@/hooks/use-sim-ws"
import { useState } from "react"

export default function Page() {
  const { status, send } = useSimWS()
  const [pending, setPending] = useState<any | null>(null)

  // Listen for recommendations
  // Minimal inline subscription; a more robust approach would use an event bus
  // but we keep this page concise.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useState(() => {
    return () => undefined
  })

  return (
    <main className="container mx-auto p-4 space-y-6">
      <DemoBanner />
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-balance">AI Train Traffic — Dashboard</h1>
        <div className="text-sm text-muted-foreground">WS: {status}</div>
      </header>

      <KPIGrid />

      <section className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-3 bg-card rounded border p-2">
          <LiveMap />
        </div>
        <aside className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">AI Actions</h2>
            <div className="space-x-2">
              <Button
                size="sm"
                onClick={() => {
                  fetch("/api/proxy/api/optimize", { method: "POST" })
                }}
              >
                Run AI Optimize
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  if (pending) {
                    send({ type: "request_approval", payload: pending })
                    setPending(null)
                  }
                }}
                disabled={!pending}
              >
                Request Supervisor
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ConflictStrip />
            <RecommendationCard />
          </div>
          
          <div className="bg-card rounded border p-4">
            <h3 className="font-medium mb-2">Activity Log</h3>
            <ActivityLog limit={10} />
          </div>
        </aside>
      </section>

      {/* Dynamic Control Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrainControlPanel />
        <LiveMetrics />
      </section>
    </main>
  )
}
