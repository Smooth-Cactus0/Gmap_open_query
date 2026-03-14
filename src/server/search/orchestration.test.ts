import assert from "node:assert/strict"
import test from "node:test"

import type { SearchConfig } from "@/lib/types"
import {
  createSearchPlan,
  estimateRunCost,
  expandPresetTypes,
  parseKeywordQuery,
} from "@/server/search/orchestration"

const baseConfig: SearchConfig = {
  areaPlaceId: "place-1",
  areaLabel: "Paris",
  centerLat: 48.8566,
  centerLng: 2.3522,
  radiusMeters: 3000,
  presetTypes: ["restaurants", "beauty"],
  keywordQuery: "laser hair removal, physiotherapy",
  filters: {
    minRating: 4,
    minReviewCount: 30,
    websiteMode: "missing",
  },
}

test("expandPresetTypes merges mapped Google types", () => {
  const types = expandPresetTypes(baseConfig.presetTypes)

  assert.ok(types.includes("restaurant"))
  assert.ok(types.includes("beauty_salon"))
  assert.equal(new Set(types).size, types.length)
})

test("parseKeywordQuery trims and filters empty values", () => {
  assert.deepEqual(parseKeywordQuery("foo, bar,  , baz"), ["foo", "bar", "baz"])
})

test("estimateRunCost returns request count and cost band", () => {
  const estimate = estimateRunCost(baseConfig)

  assert.ok(estimate.plannedRequestCount > 0)
  assert.match(estimate.estimatedCostBand, /\$/)
})

test("createSearchPlan returns tiles, google types, and keywords", () => {
  const plan = createSearchPlan(baseConfig)

  assert.ok(plan.tiles.length > 0)
  assert.ok(plan.googleTypes.length > 0)
  assert.deepEqual(plan.keywords, ["laser hair removal", "physiotherapy"])
})
