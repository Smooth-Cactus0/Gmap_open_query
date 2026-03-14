import { Queue } from "bullmq"

import { getEnv } from "@/lib/config"
import { getRedisConnection } from "@/server/redis"
import { processSearchRun } from "@/server/search/run-search"

const SEARCH_QUEUE_NAME = "search-runs"

let queue: Queue<{ runId: string }> | null = null

export function getSearchQueue() {
  const redisConnection = getRedisConnection()

  if (!redisConnection) {
    return null
  }

  if (!queue) {
    queue = new Queue(SEARCH_QUEUE_NAME, {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 2,
        removeOnComplete: 20,
        removeOnFail: 20,
      },
    })
  }

  return queue
}

export function getSearchQueueName() {
  return SEARCH_QUEUE_NAME
}

export async function enqueueSearchRun(runId: string) {
  const env = getEnv()
  const searchQueue = getSearchQueue()

  if (env.queueInline || !searchQueue) {
    void processSearchRun(runId)

    return
  }

  await searchQueue.add("run-search", { runId })
}
