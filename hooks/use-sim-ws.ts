"use client"

import { useEffect, useRef, useState } from "react"

export type WSMessage =
  | { type: "positions"; payload: any }
  | { type: "recommendation"; payload: any }
  | { type: "audit"; payload: any }
  | { type: "tracks"; payload: any }
  | { type: "metrics"; payload: any }
  | { type: "event"; payload: any }
  | { type: string; payload?: any }

export function useSimWS() {
  const [status, setStatus] = useState<"DISCONNECTED" | "CONNECTED">("DISCONNECTED")
  const wsRef = useRef<WebSocket | null>(null)
  const listenersRef = useRef<((msg: WSMessage) => void)[]>([])

  useEffect(() => {
    const defaultUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.hostname + ":8000/ws/sim"
    const url = process.env.NEXT_PUBLIC_BACKEND_WS || defaultUrl
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setStatus("CONNECTED")
      ws.send(JSON.stringify({ type: "subscribe", payload: "trains" }))
    }
    ws.onclose = () => setStatus("DISCONNECTED")
    ws.onerror = () => setStatus("DISCONNECTED")
    ws.onmessage = (evt) => {
      try {
        const msg: WSMessage = JSON.parse(evt.data)
        listenersRef.current.forEach((fn) => fn(msg))
      } catch {
        // ignore malformed
      }
    }
    return () => ws.close()
  }, [])

  function send(msg: WSMessage) {
    wsRef.current?.send(JSON.stringify(msg))
  }
  function onMessage(fn: (msg: WSMessage) => void) {
    listenersRef.current.push(fn)
    return () => {
      listenersRef.current = listenersRef.current.filter((f) => f !== fn)
    }
  }

  return { status, send, onMessage }
}
