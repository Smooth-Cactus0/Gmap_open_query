import { getEnv } from "@/lib/config"
import type { PlaceResult } from "@/lib/types"
import type { GeoPoint } from "@/server/search/geometry"

const PLACES_API_BASE = "https://places.googleapis.com/v1"
const SEARCH_FIELD_MASK = [
  "places.id",
  "places.name",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.primaryType",
  "places.rating",
  "places.userRatingCount",
  "places.websiteUri",
  "places.googleMapsUri",
  "places.businessStatus",
  "nextPageToken",
].join(",")

type GooglePlace = {
  id?: string
  name?: string
  displayName?: { text?: string }
  formattedAddress?: string
  location?: { latitude?: number; longitude?: number }
  primaryType?: string
  rating?: number
  userRatingCount?: number
  websiteUri?: string
  googleMapsUri?: string
  businessStatus?: string
}

type SearchResponse = {
  places?: GooglePlace[]
  nextPageToken?: string
}

async function googlePlacesRequest(path: string, body: object) {
  const env = getEnv()

  if (!env.googleMapsApiKey) {
    throw new Error("Missing GOOGLE_MAPS_API_KEY")
  }

  const response = await fetch(`${PLACES_API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": env.googleMapsApiKey,
      "X-Goog-FieldMask": SEARCH_FIELD_MASK,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  if (!response.ok) {
    const details = await response.text()

    throw new Error(`Google Places request failed (${response.status}): ${details}`)
  }

  return (await response.json()) as SearchResponse
}

function mapGooglePlace(place: GooglePlace): PlaceResult | null {
  const placeId = place.id ?? place.name?.replace("places/", "")
  const lat = place.location?.latitude
  const lng = place.location?.longitude
  const displayName = place.displayName?.text
  const formattedAddress = place.formattedAddress
  const googleMapsUri = place.googleMapsUri

  if (!placeId || lat === undefined || lng === undefined || !displayName || !formattedAddress || !googleMapsUri) {
    return null
  }

  return {
    placeId,
    displayName,
    formattedAddress,
    lat,
    lng,
    primaryType: place.primaryType ?? null,
    rating: place.rating ?? null,
    userRatingCount: place.userRatingCount ?? null,
    websiteUri: place.websiteUri ?? null,
    googleMapsUri,
    businessStatus: place.businessStatus ?? null,
  }
}

export async function searchNearbyPlaces(params: {
  type: string
  center: GeoPoint
  radiusMeters: number
  maxResultCount?: number
}) {
  const response = await googlePlacesRequest("/places:searchNearby", {
    includedTypes: [params.type],
    maxResultCount: params.maxResultCount ?? 20,
    rankPreference: "POPULARITY",
    locationRestriction: {
      circle: {
        center: {
          latitude: params.center.lat,
          longitude: params.center.lng,
        },
        radius: Math.max(params.radiusMeters, 150),
      },
    },
  })

  return (response.places ?? []).map(mapGooglePlace).filter(Boolean) as PlaceResult[]
}

export async function searchTextPlaces(params: {
  textQuery: string
  center: GeoPoint
  radiusMeters: number
}) {
  const results: PlaceResult[] = []
  let pageToken: string | undefined
  let pageCount = 0

  do {
    const response = await googlePlacesRequest("/places:searchText", {
      textQuery: params.textQuery,
      pageSize: 20,
      pageToken,
      locationRestriction: {
        circle: {
          center: {
            latitude: params.center.lat,
            longitude: params.center.lng,
          },
          radius: Math.max(params.radiusMeters, 150),
        },
      },
    })

    results.push(...((response.places ?? []).map(mapGooglePlace).filter(Boolean) as PlaceResult[]))
    pageToken = response.nextPageToken
    pageCount += 1
  } while (pageToken && pageCount < 3)

  return results
}
