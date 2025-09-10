// RLS-friendly: uses anon key via @supabase/ssr server client (no service role here)
import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase/server"

export async function GET() {
  const supabase = getServerSupabase()
  const { data, error } = await supabase.from("trains").select("*").order("train_id", { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = getServerSupabase()
  const body = await req.json().catch(() => ({}))
  const { train_name, current_lat, current_lng, status = "running" } = body ?? {}

  if (!train_name || typeof current_lat !== "number" || typeof current_lng !== "number") {
    return NextResponse.json({ error: "Missing fields: train_name, current_lat, current_lng" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("trains")
    .insert([{ train_name, current_lat, current_lng, status }])
    .select("*")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
