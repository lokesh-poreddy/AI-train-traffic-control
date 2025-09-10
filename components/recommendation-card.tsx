"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Play, Pause, RotateCcw, TrendingUp } from "lucide-react"
import type { Recommendation } from "@/lib/aiLogic"

export function RecommendationCard() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  useEffect(() => {
    // Mock recommendations for demo
    const mockRecommendations: Recommendation[] = [
      {
        id: "R1",
        action: "Hold",
        train: "T1",
        reason: "Block B2 occupied by T2",
        priority: "high",
      },
      {
        id: "R2",
        action: "Reroute",
        train: "T3",
        reason: "Optimize traffic flow",
        priority: "medium",
      },
      {
        id: "R3",
        action: "Speed Adjust",
        train: "T4",
        reason: "Maintain safe distance",
        priority: "low",
      },
    ]
    setRecommendations(mockRecommendations)
  }, [])

  const getPriorityColor = (priority: Recommendation["priority"]) => {
    switch (priority) {
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

  const getActionIcon = (action: Recommendation["action"]) => {
    switch (action) {
      case "Hold":
        return <Pause className="h-4 w-4" />
      case "Reroute":
        return <RotateCcw className="h-4 w-4" />
      case "Speed Adjust":
        return <TrendingUp className="h-4 w-4" />
      case "Priority Change":
        return <Play className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          AI Recommendations ({recommendations.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recommendations</p>
        ) : (
          recommendations.map((rec) => (
            <div key={rec.id} className="p-3 border rounded-md space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getActionIcon(rec.action)}
                  <span className="font-medium text-sm">
                    {rec.action} {rec.train}
                  </span>
                </div>
                <Badge variant={getPriorityColor(rec.priority)} className="text-xs">
                  {rec.priority}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{rec.reason}</p>
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-xs">
                  Apply
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs bg-transparent">
                  Dismiss
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
