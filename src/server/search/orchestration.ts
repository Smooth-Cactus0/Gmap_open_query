import { presetTypeMap } from "@/lib/presets"
import type { CostEstimate, SearchConfig } from "@/lib/types"
import { estimateCostBand } from "@/server/costs"
import { createSeedTiles, estimateSeedTileCount } from "@/server/search/geometry"

export function expandPresetTypes(presetIds: string[]) {
  return [...new Set(presetIds.flatMap((presetId) => presetTypeMap.get(presetId) ?? []))]
}

export function parseKeywordQuery(keywordQuery: string | null) {
  return (keywordQuery ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

export function estimateRunCost(config: SearchConfig): CostEstimate {
  const expandedTypes = expandPresetTypes(config.presetTypes)
  const baseTileCount = estimateSeedTileCount(config.radiusMeters)
  const keywordCount = parseKeywordQuery(config.keywordQuery).length
  const typeRequests = Math.max(expandedTypes.length, 1) * baseTileCount
  const keywordRequests = keywordCount
  const plannedRequestCount = Math.ceil((typeRequests + keywordRequests) * 1.25)

  return {
    plannedRequestCount,
    estimatedCostBand: estimateCostBand(plannedRequestCount, keywordRequests),
  }
}

export function createSearchPlan(config: SearchConfig) {
  return {
    tiles: createSeedTiles(
      { lat: config.centerLat, lng: config.centerLng },
      config.radiusMeters,
    ),
    googleTypes: expandPresetTypes(config.presetTypes),
    keywords: parseKeywordQuery(config.keywordQuery),
  }
}
