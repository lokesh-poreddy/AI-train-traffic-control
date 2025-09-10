"use client"

import LiveMap from "@/components/map"
import { DemoBanner } from "@/components/demo-banner"
import { useParams } from "next/navigation"

export default function SectionPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <main className="container mx-auto p-4 space-y-4">
      <DemoBanner />
      <h1 className="text-xl font-semibold">Section {id}</h1>
      <LiveMap />
    </main>
  )
}
