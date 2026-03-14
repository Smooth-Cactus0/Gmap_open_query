import { NextResponse } from "next/server"

import type { ExportRequest } from "@/lib/types"
import { buildCsvExport } from "@/server/exports"
import { getFilteredRunResults } from "@/server/queries"

export const runtime = "nodejs"

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const payload = (await request.json()) as ExportRequest
  const { id } = await context.params
  const run = await getFilteredRunResults(id, payload.filters)

  if (!run) {
    return NextResponse.json({ error: "Run not found." }, { status: 404 })
  }

  if (payload.format === "json") {
    return new Response(JSON.stringify(run.results, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="run-${id}.json"`,
      },
    })
  }

  return new Response(buildCsvExport(run.results), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="run-${id}.csv"`,
    },
  })
}
