import assert from "node:assert/strict"
import test from "node:test"

import type { PlaceResult } from "@/lib/types"
import { buildCsvExport } from "@/server/exports"

test("buildCsvExport serializes the expected columns", () => {
  const csv = buildCsvExport([
    {
      placeId: "abc",
      displayName: "Salon, Nice",
      formattedAddress: "10 Rue Example",
      lat: 48.8566,
      lng: 2.3522,
      primaryType: "beauty_salon",
      rating: 4.8,
      userRatingCount: 180,
      websiteUri: null,
      googleMapsUri: "https://maps.google.com/?cid=1",
      businessStatus: "OPERATIONAL",
    } satisfies PlaceResult,
  ])

  assert.match(csv, /displayName/)
  assert.match(csv, /"Salon, Nice"/)
  assert.match(csv, /OPERATIONAL/)
})
