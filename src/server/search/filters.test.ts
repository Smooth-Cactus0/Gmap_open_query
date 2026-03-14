import assert from "node:assert/strict"
import test from "node:test"

import type { PlaceResult } from "@/lib/types"
import { applyFilters, matchesFilters, normalizeFilters } from "@/server/search/filters"

const basePlace: PlaceResult = {
  placeId: "test-place",
  displayName: "Test Place",
  formattedAddress: "123 Main Street",
  lat: 48.8566,
  lng: 2.3522,
  primaryType: "restaurant",
  rating: 4.6,
  userRatingCount: 120,
  websiteUri: null,
  googleMapsUri: "https://maps.google.com/?cid=1",
  businessStatus: "OPERATIONAL",
}

test("normalizeFilters applies defaults", () => {
  assert.deepEqual(normalizeFilters(), {
    minRating: 0,
    minReviewCount: 0,
    websiteMode: "any",
  })
})

test("matchesFilters requires missing website when configured", () => {
  assert.equal(
    matchesFilters(basePlace, {
      minRating: 4,
      minReviewCount: 50,
      websiteMode: "missing",
    }),
    true,
  )

  assert.equal(
    matchesFilters(
      {
        ...basePlace,
        websiteUri: "https://example.com",
      },
      {
        minRating: 4,
        minReviewCount: 50,
        websiteMode: "missing",
      },
    ),
    false,
  )
})

test("applyFilters keeps only places meeting the thresholds", () => {
  const filtered = applyFilters(
    [
      basePlace,
      {
        ...basePlace,
        placeId: "low-reviews",
        userRatingCount: 10,
      },
      {
        ...basePlace,
        placeId: "low-rating",
        rating: 3.2,
      },
    ],
    {
      minRating: 4.5,
      minReviewCount: 100,
      websiteMode: "missing",
    },
  )

  assert.equal(filtered.length, 1)
  assert.equal(filtered[0]?.placeId, "test-place")
})
