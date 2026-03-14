import { NextResponse } from "next/server"

import { getPrisma } from "@/server/db"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const prisma = getPrisma()
  const payload = (await request.json()) as { name?: string; lastConfig?: unknown }

  if (!payload.name?.trim()) {
    return NextResponse.json({ error: "Project name is required." }, { status: 400 })
  }

  const project = await prisma.project.create({
    data: {
      name: payload.name.trim(),
      lastConfig: payload.lastConfig ?? undefined,
    },
  })

  return NextResponse.json({
    id: project.id,
    name: project.name,
  })
}
