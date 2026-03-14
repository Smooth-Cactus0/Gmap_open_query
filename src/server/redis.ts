import type { ConnectionOptions } from "bullmq"

export function getRedisConnection() {
  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    return null
  }

  const parsed = new URL(redisUrl)
  const connection: ConnectionOptions = {
    host: parsed.hostname,
    port: Number(parsed.port || 6379),
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    db: parsed.pathname ? Number(parsed.pathname.replace("/", "") || "0") : 0,
  }

  if (parsed.protocol === "rediss:") {
    connection.tls = {}
  }

  return connection
}
