const DEFAULT_RESULT_TTL_DAYS = 30

export function getEnv() {
  return {
    databaseUrl: process.env.DATABASE_URL ?? "",
    redisUrl: process.env.REDIS_URL ?? "",
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? "",
    publicGoogleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    googleMapsAttributionText:
      process.env.GOOGLE_MAPS_ATTRIBUTION_TEXT ?? "Powered by Google Maps",
    resultTtlDays: Number(process.env.RESULT_TTL_DAYS ?? DEFAULT_RESULT_TTL_DAYS),
    queueInline: (process.env.QUEUE_INLINE ?? "false") === "true",
    internalJobSecret: process.env.INTERNAL_JOB_SECRET ?? "",
  }
}

export function hasGoogleMapsKey() {
  const env = getEnv()

  return Boolean(env.googleMapsApiKey && env.publicGoogleMapsApiKey)
}
