"use client"

import useSWR from "swr"
import { fetchJSON } from "@/lib/fetcher"

export default function AuditLogPage() {
  const { data } = useSWR<{ entries: any[] }>("/api/proxy/api/audit?limit=100", fetchJSON, { refreshInterval: 4000 })
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Audit Log</h1>
      <div className="space-y-2">
        {(data?.entries || []).map((e, i) => (
          <div key={i} className="text-sm">
            <span className="text-muted-foreground text-xs mr-2">[{new Date(e.ts * 1000).toLocaleString()}]</span>
            <span className="font-medium">{e.action}</span>
            <span className="ml-2 text-muted-foreground">{JSON.stringify(e.payload)}</span>
          </div>
        ))}
      </div>
    </main>
  )
}
