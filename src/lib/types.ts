export type WebsiteMode = "missing" | "any"

export type RunStatus = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED"

export type SearchFilters = {
  minRating: number
  minReviewCount: number
  websiteMode: WebsiteMode
}

export type SearchConfig = {
  areaPlaceId: string
  areaLabel: string
  centerLat: number
  centerLng: number
  radiusMeters: number
  presetTypes: string[]
  keywordQuery: string | null
  filters: SearchFilters
}

export type PlaceResult = {
  placeId: string
  displayName: string
  formattedAddress: string
  lat: number
  lng: number
  primaryType: string | null
  rating: number | null
  userRatingCount: number | null
  websiteUri: string | null
  googleMapsUri: string
  businessStatus: string | null
}

export type CostEstimate = {
  plannedRequestCount: number
  estimatedCostBand: string
}

export type ProjectSummary = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  runCount: number
  latestRunStatus: RunStatus | null
}

export type SearchRunSummary = {
  id: string
  projectId: string
  projectName: string
  status: RunStatus
  createdAt: string
  startedAt: string | null
  finishedAt: string | null
  plannedRequestCount: number
  estimatedCostBand: string
  warningCount: number
  errorMessage: string | null
  config: SearchConfig
}

export type RunDetails = SearchRunSummary & {
  warnings: string[]
  results: PlaceResult[]
}

export type SearchRunPayload = {
  projectId?: string
  projectName?: string
  config: SearchConfig
}

export type ExportFormat = "csv" | "json"

export type ExportRequest = {
  format: ExportFormat
  filters?: Partial<SearchFilters>
}
