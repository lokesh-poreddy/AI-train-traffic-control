"use client"

import useSWR from "swr"
import { fetchJSON } from "@/lib/fetcher"

type AuditEntry = {
  ts: number
  action: string
  payload: any
}

export function ActivityLog({ limit = 20 }: { limit?: number }) {
  const { data } = useSWR<{ entries: AuditEntry[] }>(`/api/proxy/api/audit?limit=${limit}`, fetchJSON, {
    refreshInterval: 5000,
  })

  return (
    <div className="space-y-2 text-sm">
      {(data?.entries || []).map((e, i) => (
        <div key={i} className="text-foreground/80">
          <span className="text-muted-foreground text-xs mr-2">[{new Date(e.ts * 1000).toLocaleTimeString()}]</span>
          <span className="font-medium">{e.action}</span>
          <span className="ml-1 text-muted-foreground">{e.payload?.summary || e.payload?.status || ""}</span>
        </div>
      ))}
    </div>
  )
}
