import type { PlaceResult, SearchFilters } from "@/lib/types"

export function normalizeFilters(filters?: Partial<SearchFilters>): SearchFilters {
  return {
    minRating: filters?.minRating ?? 0,
    minReviewCount: filters?.minReviewCount ?? 0,
    websiteMode: filters?.websiteMode ?? "any",
  }
}

export function matchesFilters(place: PlaceResult, filters: SearchFilters) {
  const passesRating = (place.rating ?? 0) >= filters.minRating
  const passesReviewCount = (place.userRatingCount ?? 0) >= filters.minReviewCount
  const passesWebsite =
    filters.websiteMode === "any" ? true : place.websiteUri === null || place.websiteUri === ""

  return passesRating && passesReviewCount && passesWebsite
}

export function applyFilters(places: PlaceResult[], filters: SearchFilters) {
  return places.filter((place) => matchesFilters(place, filters))
}
