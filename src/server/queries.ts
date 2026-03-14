import { getPrisma } from "@/server/db"
import { applyFilters, normalizeFilters } from "@/server/search/filters"
import { purgeExpiredRunPlaces } from "@/server/search/run-search"
import {
  readSearchConfig,
  serializeProjectSummary,
  serializeRunPlace,
  serializeRunSummary,
} from "@/server/serializers"

export async function getDashboardData() {
  const prisma = getPrisma()
  await purgeExpiredRunPlaces()

  const [projects, runs] = await Promise.all([
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: {
        runs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: { runs: true },
        },
      },
    }),
    prisma.searchRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        project: true,
      },
    }),
  ])

  return {
    projects: projects.map(serializeProjectSummary),
    runs: runs.map(serializeRunSummary),
  }
}

export async function getProjectDetails(projectId: string) {
  const prisma = getPrisma()
  await purgeExpiredRunPlaces()

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      runs: {
        orderBy: { createdAt: "desc" },
        include: {
          project: true,
        },
      },
    },
  })

  if (!project) {
    return null
  }

  return {
    ...serializeProjectSummary({
      ...project,
      _count: { runs: project.runs.length },
    }),
    lastConfig: project.lastConfig ? readSearchConfig(project.lastConfig) : null,
    runs: project.runs.map(serializeRunSummary),
  }
}

export async function getRunDetails(runId: string) {
  const prisma = getPrisma()
  await purgeExpiredRunPlaces()

  const run = await prisma.searchRun.findUnique({
    where: { id: runId },
    include: {
      project: true,
      runPlaces: {
        orderBy: [{ userRatingCount: "desc" }, { rating: "desc" }, { displayName: "asc" }],
      },
    },
  })

  if (!run) {
    return null
  }

  const warnings = Array.isArray(run.warnings) ? run.warnings : []

  return {
    ...serializeRunSummary(run),
    warnings: warnings.map((warning) => String(warning)),
    results: run.runPlaces.map(serializeRunPlace),
  }
}

export async function getFilteredRunResults(
  runId: string,
  filters?: {
    minRating?: number
    minReviewCount?: number
    websiteMode?: "missing" | "any"
  },
) {
  const details = await getRunDetails(runId)

  if (!details) {
    return null
  }

  const normalizedFilters = normalizeFilters({
    ...details.config.filters,
    ...filters,
  })

  return {
    ...details,
    activeFilters: normalizedFilters,
    results: applyFilters(details.results, normalizedFilters),
  }
}
