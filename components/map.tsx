"use client"

import { useEffect, useState, useRef } from "react"
import { useSimWS } from "@/hooks/use-sim-ws"
import { checkTrackStatus, type Train, type Track } from "@/lib/aiLogic"

type LegacyTrain = {
  id: string
  label: string
  route: [number, number][]
  position: [number, number]
  speed: number
  next_section: string
}

const mockTracks: Track[] = [
  { id: "B1", from: [28.61, 77.23], to: [25.59, 85.13], status: "free" },
  { id: "B2", from: [25.59, 85.13], to: [19.07, 72.87], status: "free" },
  { id: "B3", from: [19.07, 72.87], to: [13.08, 80.27], status: "free" },
  { id: "B4", from: [13.08, 80.27], to: [22.57, 88.36], status: "free" },
]

export default function LiveMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [positions, setPositions] = useState<Record<string, LegacyTrain>>({})
  const [tracks, setTracks] = useState<Track[]>(mockTracks)
  const [isLoaded, setIsLoaded] = useState(false)
  const { onMessage, status } = useSimWS()

  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          document.head.appendChild(link)
        }

        // Load Leaflet JS
        if (!(window as any).L) {
          const script = document.createElement("script")
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          script.onload = () => {
            setIsLoaded(true)
          }
          document.head.appendChild(script)
        } else {
          setIsLoaded(true)
        }
      } catch (error) {
        console.error("Failed to load Leaflet:", error)
      }
    }

    loadLeaflet()
  }, [])

  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return

    const L = (window as any).L
    if (!L) return

    // Initialize map
    const map = L.map(mapRef.current).setView([20.0, 75.0], 6)

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isLoaded])

  useEffect(() => {
    const off = onMessage((msg) => {
      if (msg.type === "positions") {
        setPositions(msg.payload || {})
      }
    })
    return off
  }, [onMessage])

  useEffect(() => {
    const trainsToShow = positions

    const rtmsTrains: Train[] = Object.values(trainsToShow).map((train) => ({
      id: train.id,
      name: train.label,
      source: "Unknown",
      destination: train.next_section || "Unknown",
      lat: train.position[0],
      lng: train.position[1],
      speed: train.speed,
    }))

    const updatedTracks = checkTrackStatus(rtmsTrains, mockTracks)
    setTracks(updatedTracks)
  }, [positions])

  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return

    const L = (window as any).L
    const map = mapInstanceRef.current

    // Clear existing layers
    map.eachLayer((layer: any) => {
      if (layer.options && (layer.options.isTrack || layer.options.isTrain)) {
        map.removeLayer(layer)
      }
    })

    const getTrackColor = (status: Track["status"]) => {
      switch (status) {
        case "free":
          return "#22c55e" // green
        case "occupied":
          return "#ef4444" // red
        case "soon-occupied":
          return "#f59e0b" // yellow/orange
        default:
          return "#6b7280" // gray
      }
    }

    // Add tracks
    tracks.forEach((track) => {
      const polyline = L.polyline([track.from, track.to], {
        color: getTrackColor(track.status),
        weight: 6,
        opacity: 0.8,
        isTrack: true,
      }).addTo(map)

      polyline.bindPopup(`<strong>Track ${track.id}</strong><br/>Status: ${track.status}`)
    })

    const trainsToShow = positions
    Object.values(trainsToShow).forEach((train) => {
      // Add route if available
      if (Array.isArray(train.route) && train.route.length > 1) {
        L.polyline(train.route, {
          color: "#3b82f6",
          weight: 3,
          opacity: 0.4,
          isTrain: true,
        }).addTo(map)
      }

      // Add train marker
      const trainIcon = L.divIcon({
        html: `<div style="background: #3b82f6; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">🚂</div>`,
        className: "custom-train-icon",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker(train.position, {
        icon: trainIcon,
        isTrain: true,
      }).addTo(map)

      marker.bindPopup(`
        <div style="font-size: 14px;">
          <strong>${train.label}</strong><br/>
          ID: ${train.id}<br/>
          Speed: ${train.speed} km/h<br/>
          Next: ${train.next_section}<br/>
          Position: [${train.position[0].toFixed(2)}, ${train.position[1].toFixed(2)}]
        </div>
      `)
    })
  }, [tracks, positions, status, isLoaded])

  if (!isLoaded) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-muted rounded-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div ref={mapRef} style={{ height: "600px", width: "100%" }} className="rounded-md" />
    </div>
  )
}
