"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { startTransition, useState } from "react"

import { LocationPicker } from "@/components/location-picker"
import { StatusPill } from "@/components/status-pill"
import { BUSINESS_PRESETS } from "@/lib/presets"
import type { ProjectSummary, SearchConfig, SearchRunSummary } from "@/lib/types"
import { cn, formatDate } from "@/lib/utils"

type ProjectBuilderProps = {
  initialProjects: ProjectSummary[]
  initialRuns: SearchRunSummary[]
}

function estimateClientCost(config: SearchConfig) {
  const keywordCount = config.keywordQuery
    ? config.keywordQuery
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean).length
    : 0
  const typeCount = Math.max(config.presetTypes.length, 1)
  const tileFactor = Math.max(1, Math.ceil(config.radiusMeters / 1500))
  const plannedRequestCount = Math.ceil((typeCount * tileFactor * 3 + keywordCount) * 1.2)

  if (plannedRequestCount <= 20) {
    return { plannedRequestCount, estimatedCostBand: "< $1" }
  }

  if (plannedRequestCount <= 80) {
    return { plannedRequestCount, estimatedCostBand: "$1 - $5" }
  }

  if (plannedRequestCount <= 250) {
    return { plannedRequestCount, estimatedCostBand: "$5 - $20" }
  }

  return { plannedRequestCount, estimatedCostBand: "$20+" }
}

export function ProjectBuilder({ initialProjects, initialRuns }: ProjectBuilderProps) {
  const router = useRouter()
  const [projectName, setProjectName] = useState("")
  const [config, setConfig] = useState<SearchConfig>({
    areaPlaceId: "",
    areaLabel: "",
    centerLat: 48.8566,
    centerLng: 2.3522,
    radiusMeters: 3000,
    presetTypes: ["restaurants"],
    keywordQuery: "",
    filters: {
      minRating: 4,
      minReviewCount: 30,
      websiteMode: "missing",
    },
  })
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const estimate = estimateClientCost(config)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    setError(null)

    try {
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName,
          config,
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to create the search run.")
      }

      startTransition(() => {
        router.push(`/runs/${payload.id}`)
        router.refresh()
      })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create the search run.")
    } finally {
      setIsPending(false)
    }
  }

  function togglePreset(presetId: string) {
    setConfig((current) => ({
      ...current,
      presetTypes: current.presetTypes.includes(presetId)
        ? current.presetTypes.filter((item) => item !== presetId)
        : [...current.presetTypes, presetId],
    }))
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
      <form
        onSubmit={handleSubmit}
        className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(17,24,39,0.88),rgba(120,53,15,0.7))] p-6 shadow-[0_30px_120px_rgba(15,23,42,0.35)] md:p-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.14),transparent_42%)]" />
        <div className="relative space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-amber-200/80">
                Prospecting Console
              </p>
              <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Find local businesses worth contacting in one focused run.
              </h1>
            </div>
            <div className="rounded-[28px] border border-amber-200/20 bg-white/6 px-5 py-4 text-right backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-amber-100/80">Estimated load</p>
              <p className="mt-2 text-3xl font-semibold text-white">{estimate.plannedRequestCount}</p>
              <p className="mt-1 text-sm text-amber-100/80">{estimate.estimatedCostBand}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_0.45fr]">
            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-slate-300">
                Project name
              </span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/65 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-amber-300/70"
                placeholder="No-website beauty salons, East Paris"
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-slate-300">
                Radius (meters)
              </span>
              <input
                type="number"
                min={250}
                max={50000}
                step={250}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/65 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-amber-300/70"
                value={config.radiusMeters}
                onChange={(event) =>
                  setConfig((current) => ({
                    ...current,
                    radiusMeters: Number(event.target.value),
                  }))
                }
              />
            </label>
          </div>

          <LocationPicker
            value={{
              areaPlaceId: config.areaPlaceId,
              areaLabel: config.areaLabel,
              centerLat: config.centerLat,
              centerLng: config.centerLng,
            }}
            onChange={(location) =>
              setConfig((current) => ({
                ...current,
                ...location,
              }))
            }
          />

          <div className="rounded-[28px] border border-white/10 bg-slate-950/65 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-100">Business presets</p>
                <p className="mt-1 text-sm text-slate-400">
                  Combine a curated type stack with optional free-text boosting.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {BUSINESS_PRESETS.map((preset) => {
                const active = config.presetTypes.includes(preset.id)

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => togglePreset(preset.id)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition",
                      active
                        ? "border-amber-300 bg-amber-200 text-slate-950"
                        : "border-white/10 bg-white/5 text-slate-200 hover:border-amber-200/50",
                    )}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
                Optional keyword query
              </span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-amber-300/70"
                placeholder="laser hair removal, physiotherapy, vegan bakery"
                value={config.keywordQuery ?? ""}
                onChange={(event) =>
                  setConfig((current) => ({
                    ...current,
                    keywordQuery: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <div className="grid gap-4 rounded-[28px] border border-white/10 bg-slate-950/65 p-5 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
                Min rating
              </span>
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-amber-300/70"
                value={config.filters.minRating}
                onChange={(event) =>
                  setConfig((current) => ({
                    ...current,
                    filters: {
                      ...current.filters,
                      minRating: Number(event.target.value),
                    },
                  }))
                }
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
                Min reviews
              </span>
              <input
                type="number"
                min={0}
                step={10}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-amber-300/70"
                value={config.filters.minReviewCount}
                onChange={(event) =>
                  setConfig((current) => ({
                    ...current,
                    filters: {
                      ...current.filters,
                      minReviewCount: Number(event.target.value),
                    },
                  }))
                }
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
                Website filter
              </span>
              <select
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-amber-300/70"
                value={config.filters.websiteMode}
                onChange={(event) =>
                  setConfig((current) => ({
                    ...current,
                    filters: {
                      ...current.filters,
                      websiteMode: event.target.value as "missing" | "any",
                    },
                  }))
                }
              >
                <option value="missing">Missing website only</option>
                <option value="any">Any website status</option>
              </select>
            </label>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-300/30 bg-rose-100/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-xl text-sm leading-6 text-slate-300">
              Results are displayed inside the app with Google attribution. Run history keeps
              project configs long-term and place snapshots on a TTL.
            </p>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? "Launching run..." : "Create project & launch run"}
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-6">
        <section className="rounded-[32px] border border-slate-200 bg-white/92 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Saved projects</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Resume work fast</h2>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {initialProjects.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm leading-6 text-slate-500">
                No projects yet. Your first run will create one automatically.
              </p>
            ) : (
              initialProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block rounded-[24px] border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{project.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Updated {formatDate(project.updatedAt)}
                      </p>
                    </div>
                    {project.latestRunStatus ? <StatusPill status={project.latestRunStatus} /> : null}
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white/92 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Recent runs</p>
          <div className="mt-5 space-y-3">
            {initialRuns.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm leading-6 text-slate-500">
                Runs will appear here once you launch a search.
              </p>
            ) : (
              initialRuns.map((run) => (
                <Link
                  key={run.id}
                  href={`/runs/${run.id}`}
                  className="block rounded-[24px] border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{run.projectName}</p>
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
      </div>
    </div>
  )
}
