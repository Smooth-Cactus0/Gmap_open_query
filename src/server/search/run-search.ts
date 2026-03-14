import { RunStatus } from "@prisma/client"

import { getEnv } from "@/lib/config"
import type { PlaceResult, SearchConfig } from "@/lib/types"
import { getPrisma } from "@/server/db"
import { searchNearbyPlaces, searchTextPlaces } from "@/server/google-places"
import { canSplitTile, type GeoPoint, splitTile, type SearchTile } from "@/server/search/geometry"
import { createSearchPlan } from "@/server/search/orchestration"

const SATURATION_THRESHOLD = 20

function expiresAtFromNow(days: number) {
  const now = new Date()
  now.setDate(now.getDate() + days)

  return now
}

async function collectNearbyResultsForType(
  type: string,
  tile: SearchTile,
  placeMap: Map<string, PlaceResult>,
  warnings: string[],
) {
  const results = await searchNearbyPlaces({
    type,
    center: tile.center,
    radiusMeters: tile.radiusMeters,
    maxResultCount: SATURATION_THRESHOLD,
  })

  for (const place of results) {
    placeMap.set(place.placeId, place)
  }

  if (results.length >= SATURATION_THRESHOLD && canSplitTile(tile)) {
    warnings.push(
      `Tile saturation for "${type}" near ${tile.center.lat.toFixed(4)}, ${tile.center.lng.toFixed(4)}; refining coverage.`,
    )

    for (const subTile of splitTile(tile)) {
      await collectNearbyResultsForType(type, subTile, placeMap, warnings)
    }
  }
}

async function collectKeywordResults(
  keywords: string[],
  center: GeoPoint,
  radiusMeters: number,
  placeMap: Map<string, PlaceResult>,
) {
  for (const keyword of keywords) {
    const results = await searchTextPlaces({
      textQuery: keyword,
      center,
      radiusMeters,
    })

    for (const place of results) {
      placeMap.set(place.placeId, place)
    }
  }
}

async function persistResults(runId: string, places: PlaceResult[]) {
  const prisma = getPrisma()
  const ttlDays = getEnv().resultTtlDays
  const expiresAt = expiresAtFromNow(ttlDays)

  await prisma.$transaction(async (tx) => {
    for (const place of places) {
      await tx.placeReference.upsert({
        where: { placeId: place.placeId },
        update: {},
        create: {
          placeId: place.placeId,
        },
      })
    }

    await tx.runPlace.deleteMany({
      where: { runId },
    })

    if (places.length > 0) {
      await tx.runPlace.createMany({
        data: places.map((place) => ({
          runId,
          placeId: place.placeId,
          displayName: place.displayName,
          formattedAddress: place.formattedAddress,
          lat: place.lat,
          lng: place.lng,
          primaryType: place.primaryType,
          rating: place.rating,
          userRatingCount: place.userRatingCount,
          websiteUri: place.websiteUri,
          googleMapsUri: place.googleMapsUri,
          businessStatus: place.businessStatus,
          expiresAt,
        })),
      })
    }
  })
}

export async function purgeExpiredRunPlaces() {
  const prisma = getPrisma()
  await prisma.runPlace.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })
}

function readConfig(config: unknown) {
  return config as SearchConfig
}

export async function processSearchRun(runId: string) {
  const prisma = getPrisma()
  await purgeExpiredRunPlaces()

  const run = await prisma.searchRun.findUnique({
    where: { id: runId },
  })

  if (!run) {
    throw new Error(`Run not found: ${runId}`)
  }

  const config = readConfig(run.config)
  const plan = createSearchPlan(config)
  const placeMap = new Map<string, PlaceResult>()
  const warnings: string[] = []

  await prisma.searchRun.update({
    where: { id: runId },
    data: {
      status: RunStatus.RUNNING,
      startedAt: new Date(),
      errorMessage: null,
      warnings,
    },
  })

  try {
    for (const googleType of plan.googleTypes) {
      for (const tile of plan.tiles) {
        await collectNearbyResultsForType(googleType, tile, placeMap, warnings)
      }
    }

    if (plan.keywords.length > 0) {
      await collectKeywordResults(
        plan.keywords,
        { lat: config.centerLat, lng: config.centerLng },
        config.radiusMeters,
        placeMap,
      )
    }

    const places = [...placeMap.values()]

    await persistResults(runId, places)
    await prisma.project.update({
      where: { id: run.projectId },
      data: {
        lastConfig: config,
      },
    })
    await prisma.searchRun.update({
      where: { id: runId },
      data: {
        status: RunStatus.SUCCEEDED,
        warnings,
        finishedAt: new Date(),
      },
    })

    return places
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown search failure"

    await prisma.searchRun.update({
      where: { id: runId },
      data: {
        status: RunStatus.FAILED,
        warnings,
        errorMessage: message,
        finishedAt: new Date(),
      },
    })

    throw error
  }
}
