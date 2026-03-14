import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    return null
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  })
}

export function getPrisma() {
  if (!globalForPrisma.prisma) {
    const prisma = createPrismaClient()

    if (!prisma) {
      throw new Error("DATABASE_URL is required to initialize Prisma.")
    }

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prisma
    }

    return prisma
  }

  return globalForPrisma.prisma
}
