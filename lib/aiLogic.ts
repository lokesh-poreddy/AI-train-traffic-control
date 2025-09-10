export interface Train {
  id: string
  name: string
  source: string
  destination: string
  lat: number
  lng: number
  speed?: number
  direction?: number
}

export interface Track {
  id: string
  from: [number, number]
  to: [number, number]
  status: "free" | "occupied" | "soon-occupied"
}

export interface Conflict {
  id: string
  block: string
  trains: string[]
  type: "overlap" | "collision" | "speed"
  severity: "low" | "medium" | "high"
}

export interface Recommendation {
  id: string
  action: "Hold" | "Reroute" | "Speed Adjust" | "Priority Change"
  train: string
  reason: string
  priority: "low" | "medium" | "high"
}

export function checkTrackStatus(trains: Train[], tracks: Track[]): Track[] {
  return tracks.map((track) => {
    const trainsOnTrack = trains.filter((train) => {
      // Check if train is close to track start or end
      const distToStart = Math.sqrt(Math.pow(train.lat - track.from[0], 2) + Math.pow(train.lng - track.from[1], 2))
      const distToEnd = Math.sqrt(Math.pow(train.lat - track.to[0], 2) + Math.pow(train.lng - track.to[1], 2))

      return distToStart < 0.5 || distToEnd < 0.5 // Within 0.5 degree radius
    })

    let status: Track["status"] = "free"

    if (trainsOnTrack.length > 1) {
      status = "occupied" // Multiple trains = conflict
    } else if (trainsOnTrack.length === 1) {
      // Check if another train is approaching
      const approachingTrains = trains.filter((train) => {
        if (trainsOnTrack.includes(train)) return false

        const distToStart = Math.sqrt(Math.pow(train.lat - track.from[0], 2) + Math.pow(train.lng - track.from[1], 2))
        const distToEnd = Math.sqrt(Math.pow(train.lat - track.to[0], 2) + Math.pow(train.lng - track.to[1], 2))

        return distToStart < 1.0 || distToEnd < 1.0 // Within 1.0 degree radius
      })

      status = approachingTrains.length > 0 ? "soon-occupied" : "occupied"
    }

    return { ...track, status }
  })
}

// Enhanced AI optimization algorithm
export function optimizeTrainTraffic(trains: Train[], tracks: Track[]): {
  conflicts: Conflict[]
  recommendations: Recommendation[]
  optimizedSchedule: any[]
} {
  const conflicts = detectConflicts(trains, tracks)
  const recommendations = generateRecommendations(conflicts, trains)
  
  // Advanced optimization logic
  const optimizedSchedule = trains.map(train => {
    const conflictsForTrain = conflicts.filter(c => c.trains.includes(train.id))
    const recommendationsForTrain = recommendations.filter(r => r.train === train.id)
    
    let optimizedSpeed = train.speed || 60
    let suggestedAction = "proceed"
    
    if (conflictsForTrain.length > 0) {
      const highPriorityConflicts = conflictsForTrain.filter(c => c.severity === "high")
      if (highPriorityConflicts.length > 0) {
        suggestedAction = "hold"
        optimizedSpeed = 0
      } else {
        suggestedAction = "reduce_speed"
        optimizedSpeed = Math.max(20, (train.speed || 60) * 0.7)
      }
    }
    
    return {
      trainId: train.id,
      currentSpeed: train.speed || 60,
      optimizedSpeed,
      suggestedAction,
      conflicts: conflictsForTrain.length,
      recommendations: recommendationsForTrain.length,
      estimatedDelay: conflictsForTrain.length * 2 // 2 minutes per conflict
    }
  })
  
  return {
    conflicts,
    recommendations,
    optimizedSchedule
  }
}

// Calculate system efficiency metrics
export function calculateSystemMetrics(trains: Train[], tracks: Track[]): {
  throughput: number
  averageDelay: number
  utilization: number
  safetyScore: number
} {
  const conflicts = detectConflicts(trains, tracks)
  const totalTrains = trains.length
  const totalTracks = tracks.length
  const occupiedTracks = tracks.filter(t => t.status === "occupied").length
  
  const throughput = totalTrains / Math.max(1, conflicts.length + 1) // Trains per conflict cycle
  const averageDelay = conflicts.length * 2.5 // Average 2.5 minutes per conflict
  const utilization = occupiedTracks / totalTracks
  const safetyScore = Math.max(0, 1 - (conflicts.length / totalTrains)) // Higher conflicts = lower safety
  
  return {
    throughput: Math.round(throughput * 10) / 10,
    averageDelay: Math.round(averageDelay * 10) / 10,
    utilization: Math.round(utilization * 100) / 100,
    safetyScore: Math.round(safetyScore * 100) / 100
  }
}

export function detectConflicts(trains: Train[], tracks: Track[]): Conflict[] {
  const conflicts: Conflict[] = []

  tracks.forEach((track) => {
    const trainsOnTrack = trains.filter((train) => {
      const distToStart = Math.sqrt(Math.pow(train.lat - track.from[0], 2) + Math.pow(train.lng - track.from[1], 2))
      const distToEnd = Math.sqrt(Math.pow(train.lat - track.to[0], 2) + Math.pow(train.lng - track.to[1], 2))

      return distToStart < 0.5 || distToEnd < 0.5
    })

    if (trainsOnTrack.length > 1) {
      conflicts.push({
        id: `C-${track.id}-${Date.now()}`,
        block: track.id,
        trains: trainsOnTrack.map((t) => t.id),
        type: "overlap",
        severity: "high",
      })
    }
  })

  return conflicts
}

export function generateRecommendations(conflicts: Conflict[], trains: Train[]): Recommendation[] {
  const recommendations: Recommendation[] = []

  conflicts.forEach((conflict) => {
    if (conflict.type === "overlap" && conflict.trains.length > 1) {
      // Hold the second train
      const trainToHold = conflict.trains[1]
      recommendations.push({
        id: `R-${conflict.id}`,
        action: "Hold",
        train: trainToHold,
        reason: `Block ${conflict.block} occupied by ${conflict.trains[0]}`,
        priority: conflict.severity,
      })
    }
  })

  return recommendations
}
