import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:8000"

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const url = new URL(req.url)
  const target = `${BACKEND_URL}/${params.path.join("/")}${url.search}`
  const res = await fetch(target, {
    method: "GET",
    headers: forwardHeaders(req),
    cache: "no-store",
  })
  return streamResponse(res)
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const url = new URL(req.url)
  const target = `${BACKEND_URL}/${params.path.join("/")}${url.search}`
  const body = await req.text()
  const res = await fetch(target, {
    method: "POST",
    headers: {
      ...forwardHeaders(req),
      "content-type": req.headers.get("content-type") || "application/json",
    },
    body,
  })
  return streamResponse(res)
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  const url = new URL(req.url)
  const target = `${BACKEND_URL}/${params.path.join("/")}${url.search}`
  const body = await req.text()
  const res = await fetch(target, {
    method: "PUT",
    headers: {
      ...forwardHeaders(req),
      "content-type": req.headers.get("content-type") || "application/json",
    },
    body,
  })
  return streamResponse(res)
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  const url = new URL(req.url)
  const target = `${BACKEND_URL}/${params.path.join("/")}${url.search}`
  const res = await fetch(target, {
    method: "DELETE",
    headers: forwardHeaders(req),
  })
  return streamResponse(res)
}

function forwardHeaders(req: NextRequest) {
  const headers: Record<string, string> = {}
  const auth = req.headers.get("authorization")
  if (auth) headers.authorization = auth
  return headers
}

async function streamResponse(res: Response) {
  const headers = new Headers(res.headers)
  // Remove hop-by-hop headers if any
  headers.delete("content-encoding")
  return new NextResponse(res.body, {
    status: res.status,
    headers,
  })
}
