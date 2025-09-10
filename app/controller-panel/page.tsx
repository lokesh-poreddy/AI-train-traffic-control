"use client"

import useSWR from "swr"
import { fetchJSON } from "@/lib/fetcher"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ControllerPanel() {
  const { data, mutate } = useSWR<any>("/api/proxy/api/recommendations/active", fetchJSON, {
    refreshInterval: 2000,
  })

  async function accept(recId: string) {
    await fetchJSON(`/api/proxy/api/recommendation/${recId}/accept`, {
      method: "POST",
    })
    mutate()
  }
  async function requestSupervisor(recId: string) {
    await fetchJSON(`/api/proxy/api/recommendation/${recId}/request_supervisor`, {
      method: "POST",
    })
    mutate()
  }

  const rec = data?.recommendation
  return (
    <main className="container mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">Controller Panel</h1>
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rec ? (
            <>
              <div className="font-medium">{rec.summary}</div>
              <div className="text-sm text-muted-foreground">
                Time saved: {rec.metric?.time_saved_min?.toFixed(1)} min
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => accept(rec.id)}>Accept</Button>
                <Button variant="secondary" onClick={() => requestSupervisor(rec.id)}>
                  Request Supervisor
                </Button>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">No active recommendations</div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
