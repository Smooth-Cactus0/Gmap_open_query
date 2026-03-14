import type { Project, RunPlace, SearchRun } from "@prisma/client"

import type { PlaceResult, ProjectSummary, SearchConfig, SearchRunSummary } from "@/lib/types"

export function readSearchConfig(config: unknown) {
  return config as SearchConfig
}

export function serializeRunPlace(runPlace: RunPlace): PlaceResult {
  return {
    placeId: runPlace.placeId,
    displayName: runPlace.displayName,
    formattedAddress: runPlace.formattedAddress,
    lat: runPlace.lat,
    lng: runPlace.lng,
    primaryType: runPlace.primaryType,
    rating: runPlace.rating,
    userRatingCount: runPlace.userRatingCount,
    websiteUri: runPlace.websiteUri,
    googleMapsUri: runPlace.googleMapsUri,
    businessStatus: runPlace.businessStatus,
  }
}

export function serializeProjectSummary(
  project: Project & {
    runs: SearchRun[]
    _count: { runs: number }
  },
): ProjectSummary {
  return {
    id: project.id,
    name: project.name,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    runCount: project._count.runs,
    latestRunStatus: project.runs[0]?.status ?? null,
  }
}

export function serializeRunSummary(
  run: SearchRun & {
    project: Project
  },
): SearchRunSummary {
  const warnings = Array.isArray(run.warnings) ? run.warnings : []

  return {
    id: run.id,
    projectId: run.projectId,
    projectName: run.project.name,
    status: run.status,
    createdAt: run.createdAt.toISOString(),
    startedAt: run.startedAt?.toISOString() ?? null,
    finishedAt: run.finishedAt?.toISOString() ?? null,
    plannedRequestCount: run.plannedRequestCount,
    estimatedCostBand: run.estimatedCostBand,
    warningCount: warnings.length,
    errorMessage: run.errorMessage,
    config: readSearchConfig(run.config),
  }
}
