import { NextResponse } from "next/server"

import { getEnv } from "@/lib/config"
import { processSearchRun } from "@/server/search/run-search"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const secret = request.headers.get("x-internal-job-secret")
  const env = getEnv()

  if (!env.internalJobSecret || secret !== env.internalJobSecret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const payload = (await request.json()) as { runId?: string }

  if (!payload.runId) {
    return NextResponse.json({ error: "runId is required." }, { status: 400 })
  }

  await processSearchRun(payload.runId)

  return NextResponse.json({ ok: true })
}
