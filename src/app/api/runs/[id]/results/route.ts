import { NextResponse } from "next/server"

import { getFilteredRunResults } from "@/server/queries"

export const runtime = "nodejs"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const { searchParams } = new URL(request.url)
  const run = await getFilteredRunResults(id, {
    minRating: Number(searchParams.get("minRating") ?? 0),
    minReviewCount: Number(searchParams.get("minReviewCount") ?? 0),
    websiteMode: searchParams.get("websiteMode") === "missing" ? "missing" : "any",
  })

  if (!run) {
    return NextResponse.json({ error: "Run not found." }, { status: 404 })
  }

  return NextResponse.json(run)
}
