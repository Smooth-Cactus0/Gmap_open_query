import type { PlaceResult } from "@/lib/types"

function csvEscape(value: string | number | null) {
  if (value === null) {
    return ""
  }

  const raw = String(value)

  if (raw.includes(",") || raw.includes('"') || raw.includes("\n")) {
    return `"${raw.replaceAll('"', '""')}"`
  }

  return raw
}

export function buildCsvExport(places: PlaceResult[]) {
  const header = [
    "placeId",
    "displayName",
    "formattedAddress",
    "lat",
    "lng",
    "primaryType",
    "rating",
    "userRatingCount",
    "websiteUri",
    "googleMapsUri",
    "businessStatus",
  ]

  const rows = places.map((place) =>
    [
      place.placeId,
      place.displayName,
      place.formattedAddress,
      place.lat,
      place.lng,
      place.primaryType,
      place.rating,
      place.userRatingCount,
      place.websiteUri,
      place.googleMapsUri,
      place.businessStatus,
    ]
      .map((value) => csvEscape(value ?? null))
      .join(","),
  )

  return [header.join(","), ...rows].join("\n")
}
