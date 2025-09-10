"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { jsonFetcher } from "@/lib/fetcher"
import { getBrowserSupabase } from "@/lib/supabase/client"
import "leaflet/dist/leaflet.css"

// Dynamically import only the parts we need from react-leaflet to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false })
const CircleMarker = dynamic(() => import("react-leaflet").then((m) => m.CircleMarker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false })

type Train = {
  train_id: number
  train_name: string
  current_lat: number
  current_lng: number
  status: string
}

const DEFAULT_CENTER: [number, number] = [17.385044, 78.486671]

export default function TrainMap() {
  const [realtimeReady, setRealtimeReady] = useState(false)
  const { data: trains, mutate } = useSWR<Train[]>("/api/trains", jsonFetcher, {
    revalidateOnFocus: false,
  })

  // Subscribe to realtime changes on trains
  useEffect(() => {
    const supabase = getBrowserSupabase()
    const channel = supabase
      .channel("trains-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "trains" }, (payload: any) => {
        // Update local cache optimistically to reflect inserts/updates/deletes
        mutate(
          (current) => {
            if (!current) return current
            if (payload.eventType === "INSERT") {
              const exists = current.some((t) => t.train_id === payload.new.train_id)
              return exists ? current : [...current, payload.new]
            }
            if (payload.eventType === "UPDATE") {
              return current.map((t) => (t.train_id === payload.new.train_id ? payload.new : t))
            }
            if (payload.eventType === "DELETE") {
              return current.filter((t) => t.train_id !== payload.old.train_id)
            }
            return current
          },
          { revalidate: false },
        )
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setRealtimeReady(true)
      })

    return () => {
      const supabase = getBrowserSupabase()
      supabase.removeChannel(channel)
    }
  }, [mutate])

  const center = useMemo<[number, number]>(() => {
    if (!trains || trains.length === 0) return DEFAULT_CENTER
    return [trains[0].current_lat, trains[0].current_lng]
  }, [trains])

  return (
    <div className="w-full h-[calc(100vh-64px)] rounded-md overflow-hidden border">
      <MapContainer center={center} zoom={13} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {(trains ?? []).map((train) => (
          <CircleMarker
            key={train.train_id}
            center={[train.current_lat, train.current_lng]}
            radius={8}
            pathOptions={{ color: train.status === "running" ? "#0ea5e9" : "#ef4444", weight: 2, fillOpacity: 0.8 }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-medium">{train.train_name}</div>
                <div className="text-muted-foreground">Status: {train.status}</div>
                <div className="text-muted-foreground">
                  Lat: {train.current_lat.toFixed(5)}, Lng: {train.current_lng.toFixed(5)}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
