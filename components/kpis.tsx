"use client"

import useSWR from "swr"
import { fetchJSON } from "@/lib/fetcher"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type KPIs = {
  punctuality: number
  avg_delay_min: number
  throughput_trains_per_hr: number
  utilization_pct: number
  active_conflicts?: number
  safety_score?: number
  efficiency_score?: number
}

export function KPIGrid() {
  const { data } = useSWR<KPIs>("/api/proxy/api/kpis", fetchJSON, {
    refreshInterval: 5000,
  })
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
      <KPI title="Punctuality" value={fmtPct(data?.punctuality)} />
      <KPI title="Avg Delay" value={`${data?.avg_delay_min?.toFixed(1) ?? "--"} min`} />
      <KPI title="Throughput" value={`${data?.throughput_trains_per_hr?.toFixed(1) ?? "--"} tph`} />
      <KPI title="Utilization" value={fmtPct(data?.utilization_pct)} />
      <KPI title="Conflicts" value={`${data?.active_conflicts ?? 0}`} />
      <KPI title="Safety" value={fmtPct(data?.safety_score)} />
      <KPI title="Efficiency" value={fmtPct(data?.efficiency_score)} />
    </div>
  )
}

function KPI({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  )
}

function fmtPct(n?: number) {
  if (typeof n !== "number") return "--"
  return `${(n * 100).toFixed(0)}%`
}
