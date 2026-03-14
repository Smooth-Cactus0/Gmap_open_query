import { NextResponse } from "next/server"

import type { SearchRunPayload } from "@/lib/types"
import { getPrisma } from "@/server/db"
import { enqueueSearchRun } from "@/server/queue"
import { estimateRunCost } from "@/server/search/orchestration"

export const runtime = "nodejs"

function validatePayload(payload: SearchRunPayload) {
  if (!payload.projectId && !payload.projectName?.trim()) {
    throw new Error("Provide either projectId or projectName.")
  }

  if (!payload.config.areaPlaceId || !payload.config.areaLabel) {
    throw new Error("Area selection is required.")
  }

  if (!payload.config.presetTypes.length && !payload.config.keywordQuery?.trim()) {
    throw new Error("Choose at least one preset or add a keyword query.")
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrisma()
    const payload = (await request.json()) as SearchRunPayload
    validatePayload(payload)

    const costEstimate = estimateRunCost(payload.config)
    const project =
      payload.projectId
        ? await prisma.project.findUniqueOrThrow({
            where: { id: payload.projectId },
          })
        : await prisma.project.create({
            data: {
              name: payload.projectName!.trim(),
              lastConfig: payload.config,
            },
          })

    const run = await prisma.searchRun.create({
      data: {
        projectId: project.id,
        plannedRequestCount: costEstimate.plannedRequestCount,
        estimatedCostBand: costEstimate.estimatedCostBand,
        config: payload.config,
        warnings: [],
      },
      include: {
        project: true,
      },
    })

    await enqueueSearchRun(run.id)

    return NextResponse.json({
      id: run.id,
      projectId: project.id,
      status: run.status,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create search run.",
      },
      { status: 400 },
    )
  }
}
