"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Play, Pause, Square, Plus, AlertTriangle } from "lucide-react"
import { fetchJSON } from "@/lib/fetcher"

type Train = {
  id: string
  label: string
  type: string
  speed: number
  max_speed: number
  status: string
  delay: number
  priority: string
  passengers?: number
  cargo?: string
}

export function TrainControlPanel() {
  const [trains, setTrains] = useState<Train[]>([])
  const [selectedTrain, setSelectedTrain] = useState<string | null>(null)
  const [speedValue, setSpeedValue] = useState([50])

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const data = await fetchJSON("/api/proxy/api/trains")
        setTrains(data.trains || [])
        if (data.trains?.length > 0 && !selectedTrain) {
          setSelectedTrain(data.trains[0].id)
          setSpeedValue([data.trains[0].speed])
        }
      } catch (error) {
        console.error("Failed to fetch trains:", error)
      }
    }

    fetchTrains()
    const interval = setInterval(fetchTrains, 2000)
    return () => clearInterval(interval)
  }, [selectedTrain])

  const handleSpeedChange = async (newSpeed: number[]) => {
    if (!selectedTrain) return
    
    try {
      await fetchJSON(`/api/proxy/api/train/${selectedTrain}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "speed", value: newSpeed[0] })
      })
      setSpeedValue(newSpeed)
    } catch (error) {
      console.error("Failed to change speed:", error)
    }
  }

  const handleTrainControl = async (action: string) => {
    if (!selectedTrain) return
    
    try {
      await fetchJSON(`/api/proxy/api/train/${selectedTrain}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      })
    } catch (error) {
      console.error(`Failed to ${action} train:`, error)
    }
  }

  const handleAddTrain = async () => {
    try {
      await fetchJSON("/api/proxy/api/simulation/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: "add_train" })
      })
    } catch (error) {
      console.error("Failed to add train:", error)
    }
  }

  const handleEmergencyStop = async () => {
    try {
      await fetchJSON("/api/proxy/api/simulation/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: "emergency_stop" })
      })
    } catch (error) {
      console.error("Failed to emergency stop:", error)
    }
  }

  const selectedTrainData = trains.find(t => t.id === selectedTrain)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Train Control Panel</span>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddTrain} variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Train
            </Button>
            <Button size="sm" onClick={handleEmergencyStop} variant="destructive">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Emergency Stop
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Train Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Select Train</label>
          <div className="grid grid-cols-1 gap-2">
            {trains.map((train) => (
              <div
                key={train.id}
                className={`p-2 border rounded cursor-pointer transition-colors ${
                  selectedTrain === train.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                }`}
                onClick={() => {
                  setSelectedTrain(train.id)
                  setSpeedValue([train.speed])
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{train.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {train.type} • {train.passengers ? `${train.passengers} passengers` : train.cargo}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={train.status === 'running' ? 'default' : 'secondary'}>
                      {train.status}
                    </Badge>
                    <Badge variant={train.priority === 'high' ? 'destructive' : train.priority === 'medium' ? 'default' : 'secondary'}>
                      {train.priority}
                    </Badge>
                  </div>
                </div>
                {train.delay > 0 && (
                  <div className="text-xs text-orange-600 mt-1">
                    Delay: {train.delay.toFixed(1)} min
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Train Controls */}
        {selectedTrainData && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Speed Control: {speedValue[0]} km/h (Max: {selectedTrainData.max_speed} km/h)
              </label>
              <Slider
                value={speedValue}
                onValueChange={setSpeedValue}
                onValueCommit={handleSpeedChange}
                max={selectedTrainData.max_speed}
                min={0}
                step={5}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleTrainControl("start")}
                disabled={selectedTrainData.status === 'running'}
              >
                <Play className="h-4 w-4 mr-1" />
                Start
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleTrainControl("stop")}
                disabled={selectedTrainData.status === 'stopped'}
              >
                <Pause className="h-4 w-4 mr-1" />
                Stop
              </Button>
            </div>

            {/* Train Status */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Current Speed:</span>
                <div className="font-medium">{selectedTrainData.speed} km/h</div>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <div className="font-medium capitalize">{selectedTrainData.status}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Priority:</span>
                <div className="font-medium capitalize">{selectedTrainData.priority}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Delay:</span>
                <div className="font-medium">{selectedTrainData.delay.toFixed(1)} min</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
