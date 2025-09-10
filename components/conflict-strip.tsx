"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Zap } from "lucide-react"
import type { Conflict } from "@/lib/aiLogic"

export function ConflictStrip() {
  const [conflicts, setConflicts] = useState<Conflict[]>([])

  useEffect(() => {
    // Mock conflicts for demo
    const mockConflicts: Conflict[] = [
      {
        id: "C1",
        block: "B2",
        trains: ["T1", "T2"],
        type: "overlap",
        severity: "high",
      },
      {
        id: "C2",
        block: "B4",
        trains: ["T3"],
        type: "speed",
        severity: "medium",
      },
    ]
    setConflicts(mockConflicts)
  }, [])

  const getSeverityColor = (severity: Conflict["severity"]) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getIcon = (type: Conflict["type"]) => {
    switch (type) {
      case "overlap":
        return <AlertTriangle className="h-4 w-4" />
      case "collision":
        return <Zap className="h-4 w-4" />
      case "speed":
        return <Clock className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Active Conflicts ({conflicts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {conflicts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active conflicts</p>
        ) : (
          conflicts.map((conflict) => (
            <div key={conflict.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
              <div className="flex items-center gap-2">
                {getIcon(conflict.type)}
                <div>
                  <div className="text-sm font-medium">Block {conflict.block}</div>
                  <div className="text-xs text-muted-foreground">Trains: {conflict.trains.join(", ")}</div>
                </div>
              </div>
              <Badge variant={getSeverityColor(conflict.severity)} className="text-xs">
                {conflict.severity}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
