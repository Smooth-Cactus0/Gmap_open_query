import Link from "next/link"
import { notFound } from "next/navigation"

import { StatusPill } from "@/components/status-pill"
import { formatDate, formatNumber } from "@/lib/utils"
import { getProjectDetails } from "@/server/queries"

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProjectDetails(id)

  if (!project) {
    notFound()
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-8 px-5 py-8 md:px-8 md:py-10">
      <section className="rounded-[36px] border border-white/10 bg-[linear-gradient(125deg,rgba(15,23,42,0.98),rgba(30,41,59,0.94),rgba(120,53,15,0.76))] p-7 text-white shadow-[0_30px_120px_rgba(15,23,42,0.28)]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-amber-100/80">Project</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">{project.name}</h1>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              {project.runCount} runs • updated {formatDate(project.updatedAt)}
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            New run
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.38fr_0.62fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white/92 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Last config</p>
          {project.lastConfig ? (
            <div className="mt-5 space-y-4 text-sm text-slate-600">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Area</p>
                <p className="mt-1 font-medium text-slate-950">{project.lastConfig.areaLabel}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Radius</p>
                  <p className="mt-1 font-medium text-slate-950">
                    {formatNumber(project.lastConfig.radiusMeters)}m
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Presets</p>
                  <p className="mt-1 font-medium text-slate-950">
                    {project.lastConfig.presetTypes.join(", ") || "—"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Filters</p>
                <p className="mt-1 font-medium text-slate-950">
                  {project.lastConfig.filters.minRating}+ stars •{" "}
                  {formatNumber(project.lastConfig.filters.minReviewCount)} reviews •{" "}
                  {project.lastConfig.filters.websiteMode === "missing"
                    ? "missing website only"
                    : "all websites"}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">This project has not stored a config yet.</p>
          )}
        </div>

        <section className="rounded-[30px] border border-slate-200 bg-white/92 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Run history</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Saved runs</h2>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {project.runs.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm leading-6 text-slate-500">
                No runs for this project yet.
              </p>
            ) : (
              project.runs.map((run) => (
                <Link
                  key={run.id}
                  href={`/runs/${run.id}`}
                  className="block rounded-[24px] border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-950">{formatDate(run.createdAt)}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {run.plannedRequestCount} planned requests • {run.estimatedCostBand}
                      </p>
                    </div>
                    <StatusPill status={run.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  )
}
