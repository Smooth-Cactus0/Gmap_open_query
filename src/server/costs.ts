import { clamp } from "@/lib/utils"

const NEARBY_SEARCH_PRICE_PER_THOUSAND = 35
const TEXT_SEARCH_PRICE_PER_THOUSAND = 35

export function estimateCostBand(
  plannedRequestCount: number,
  keywordCount: number,
) {
  const keywordRequests = clamp(keywordCount, 0, plannedRequestCount)
  const nearbyRequests = Math.max(plannedRequestCount - keywordRequests, 0)

  const estimateUsd =
    (nearbyRequests / 1000) * NEARBY_SEARCH_PRICE_PER_THOUSAND +
    (keywordRequests / 1000) * TEXT_SEARCH_PRICE_PER_THOUSAND

  if (estimateUsd < 1) {
    return "< $1"
  }

  if (estimateUsd < 5) {
    return "$1 - $5"
  }

  if (estimateUsd < 20) {
    return "$5 - $20"
  }

  return "$20+"
}
