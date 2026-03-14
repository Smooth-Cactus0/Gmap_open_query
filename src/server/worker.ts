import { Worker } from "bullmq"

import { getSearchQueueName } from "@/server/queue"
import { getRedisConnection } from "@/server/redis"
import { processSearchRun, purgeExpiredRunPlaces } from "@/server/search/run-search"

async function main() {
  const redisConnection = getRedisConnection()

  if (!redisConnection) {
    throw new Error("REDIS_URL is required to run the worker process")
  }

  await purgeExpiredRunPlaces()

  const worker = new Worker(
    getSearchQueueName(),
    async (job) => {
      await processSearchRun(job.data.runId)
    },
    {
      connection: redisConnection,
      concurrency: 2,
    },
  )

  worker.on("ready", () => {
    console.log("Search worker ready")
  })

  worker.on("failed", (job, error) => {
    console.error(`Search run failed for ${job?.data.runId ?? "unknown run"}:`, error)
  })
}

void main()
