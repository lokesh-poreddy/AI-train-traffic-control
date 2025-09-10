"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, Train, AlertTriangle, TrendingUp, Clock } from "lucide-react"
import { fetchJSON } from "@/lib/fetcher"

type SystemMetrics = {
  active_trains: number
  active_conflicts: number
  system_load: number
  efficiency_score: number
  total_trains: number
}

type SystemStatus = {
  trains: any[]
  tracks: any[]
  metrics: SystemMetrics
  active_conflicts: number
  timestamp: number
}

export function LiveMetrics() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        const data = await fetchJSON("/api/proxy/api/system/status")
        setSystemStatus(data)
        setLastUpdate(new Date())
      } catch (error) {
        console.error("Failed to fetch system status:", error)
      }
    }

    fetchSystemStatus()
    const interval = setInterval(fetchSystemStatus, 1000) // Update every second
    return () => clearInterval(interval)
  }, [])

  if (!systemStatus) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading system status...</div>
        </CardContent>
      </Card>
    )
  }

  const { metrics, trains, tracks } = systemStatus
  const occupiedTracks = tracks.filter(t => t.status === 'occupied').length
  const totalTracks = tracks.length

  return (
    <div className="space-y-4">
      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>System Overview</span>
            <Badge variant="outline" className="text-xs">
              Last update: {lastUpdate.toLocaleTimeString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Train className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{metrics.active_trains}</div>
              <div className="text-xs text-muted-foreground">Active Trains</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">{metrics.active_conflicts}</div>
              <div className="text-xs text-muted-foreground">Conflicts</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{(metrics.system_load * 100).toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">System Load</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold">{(metrics.efficiency_score * 100).toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">Efficiency</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Track Status */}
      <Card>
        <CardHeader>
          <CardTitle>Track Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Track Utilization</span>
              <span className="text-sm font-medium">{occupiedTracks}/{totalTracks}</span>
            </div>
            <Progress value={(occupiedTracks / totalTracks) * 100} className="h-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className={`p-2 rounded text-xs ${
                    track.status === 'occupied' 
                      ? 'bg-red-100 text-red-800 border border-red-200' 
                      : 'bg-green-100 text-green-800 border border-green-200'
                  }`}
                >
                  <div className="font-medium">Track {track.id}</div>
                  <div className="text-xs">
                    {track.status === 'occupied' 
                      ? `Occupied by ${track.occupied_by || 'Unknown'}` 
                      : 'Free'
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Train Status */}
      <Card>
        <CardHeader>
          <CardTitle>Train Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {trains.map((train) => (
              <div key={train.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <div className="font-medium text-sm">{train.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {train.type} • {train.speed} km/h
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      train.status === 'running' ? 'default' : 
                      train.status === 'stopped' ? 'secondary' : 'destructive'
                    }
                  >
                    {train.status}
                  </Badge>
                  {train.delay > 0 && (
                    <Badge variant="outline" className="text-orange-600">
                      <Clock className="h-3 w-3 mr-1" />
                      {train.delay.toFixed(1)}m
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
