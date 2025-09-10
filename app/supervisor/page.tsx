"use client"

import useSWR from "swr"
import { fetchJSON } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

type Ticket = {
  ticket_id: string
  payload: any
  status: string
  created_at: number
}

export default function SupervisorPage() {
  const { data, mutate } = useSWR<{ tickets: Ticket[] }>("/api/proxy/api/approvals/pending", fetchJSON, {
    refreshInterval: 2000,
  })
  const [comment, setComment] = useState("Looks good")

  async function approve(ticketId: string) {
    await fetchJSON(`/api/proxy/api/approval/${ticketId}/approve`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ comment }),
    })
    mutate()
  }

  async function reject(ticketId: string) {
    await fetchJSON(`/api/proxy/api/approval/${ticketId}/reject`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ comment }),
    })
    mutate()
  }

  return (
    <main className="container mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">Supervisor Queue</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Approval comment" />
          {(data?.tickets || []).map((t) => (
            <div key={t.ticket_id} className="border rounded p-3">
              <div className="text-sm mb-2">
                <span className="font-medium">Ticket:</span> {t.ticket_id}
              </div>
              <div className="text-sm mb-2">{t.payload?.summary}</div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => approve(t.ticket_id)}>
                  Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => reject(t.ticket_id)}>
                  Reject
                </Button>
              </div>
            </div>
          ))}
          {!data?.tickets?.length && <div className="text-sm text-muted-foreground">No pending tickets</div>}
        </CardContent>
      </Card>
    </main>
  )
}
