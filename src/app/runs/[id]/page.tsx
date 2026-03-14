import { notFound } from "next/navigation"

import { RunWorkspace } from "@/components/run-workspace"
import { getRunDetails } from "@/server/queries"

export default async function RunPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const run = await getRunDetails(id)

  if (!run) {
    notFound()
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1520px] flex-col gap-8 px-5 py-8 md:px-8 md:py-10">
      <RunWorkspace
        run={run}
        attributionText={process.env.GOOGLE_MAPS_ATTRIBUTION_TEXT ?? "Powered by Google Maps"}
      />
    </main>
  )
}
