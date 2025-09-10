"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Clock, Activity, AlertTriangle } from "lucide-react"

export function KPIDashboard() {
  // Mock KPI data
  const kpis = [
    {
      title: "Throughput",
      value: "847",
      unit: "trains/day",
      change: "+12%",
      trend: "up",
      icon: TrendingUp,
    },
    {
      title: "Average Delay",
      value: "4.2",
      unit: "minutes",
      change: "-8%",
      trend: "down",
      icon: Clock,
    },
    {
      title: "Track Utilization",
      value: "78%",
      unit: "capacity",
      change: "+5%",
      trend: "up",
      icon: Activity,
    },
    {
      title: "Active Conflicts",
      value: "3",
      unit: "incidents",
      change: "-2",
      trend: "down",
      icon: AlertTriangle,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <div className="text-xs text-muted-foreground">{kpi.unit}</div>
            <p className={`text-xs ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {kpi.change} from last period
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
