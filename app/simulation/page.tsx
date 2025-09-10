"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { fetchJSON } from "@/lib/fetcher"

export default function SimulationPage() {
  const [train, setTrain] = useState("T1")
  const [delay, setDelay] = useState(15)

  async function run() {
    await fetchJSON("/api/proxy/api/simulate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ train_id: train, delay_min: delay }),
    })
  }

  return (
    <main className="container mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">What-if Simulation</h1>
      <div className="flex flex-col gap-3 max-w-md">
        <label className="text-sm">Train ID</label>
        <Input value={train} onChange={(e) => setTrain(e.target.value)} />
        <label className="text-sm">Delay (min)</label>
        <Input type="number" value={delay} onChange={(e) => setDelay(Number(e.target.value))} />
        <Button onClick={run}>Run Simulation</Button>
      </div>
      <p className="text-sm text-muted-foreground">In demo, results stream to the map and dashboard via WebSocket.</p>
    </main>
  )
}
