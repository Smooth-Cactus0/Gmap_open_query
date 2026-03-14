"use client"

import Link from "next/link"
import { useDeferredValue, useState } from "react"

import { MapCanvas } from "@/components/map-canvas"
import { StatusPill } from "@/components/status-pill"
import type { RunDetails, SearchFilters } from "@/lib/types"
import { formatDate, formatNumber } from "@/lib/utils"

type RunWorkspaceProps = {
  run: RunDetails
  attributionText: string
}

export function RunWorkspace({ run, attributionText }: RunWorkspaceProps) {
  const [filters, setFilters] = useState<SearchFilters>(run.config.filters)
  const [sortMode, setSortMode] = useState<"reviews" | "rating" | "alpha">("reviews")
  const deferredFilters = useDeferredValue(filters)

  const filteredResults = run.results
    .filter((place) => (place.rating ?? 0) >= deferredFilters.minRating)
    .filter((place) => (place.userRatingCount ?? 0) >= deferredFilters.minReviewCount)
    .filter((place) =>
      deferredFilters.websiteMode === "any" ? true : place.websiteUri === null || place.websiteUri === "",
    )
    .sort((left, right) => {
      if (sortMode === "rating") {
        return (right.rating ?? 0) - (left.rating ?? 0)
      }

      if (sortMode === "alpha") {
        return left.displayName.localeCompare(right.displayName)
      }

      return (right.userRatingCount ?? 0) - (left.userRatingCount ?? 0)
    })

  async function downloadExport(format: "csv" | "json") {
    const response = await fetch(`/api/runs/${run.id}/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        format,
        filters,
      }),
    })

    if (!response.ok) {
      return
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")

    anchor.href = url
    anchor.download = `run-${run.id}.${format}`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(120deg,rgba(15,23,42,0.98),rgba(30,41,59,0.94),rgba(14,116,144,0.8))] p-7 text-white shadow-[0_30px_120px_rgba(15,23,42,0.28)]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.32em] text-sky-100/80">Run workspace</p>
            <h1 className="text-4xl font-semibold tracking-tight">{run.projectName}</h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-200">
              {run.config.areaLabel} • radius {formatNumber(run.config.radiusMeters)}m •{" "}
              {run.plannedRequestCount} planned requests • {run.estimatedCostBand}
            </p>
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.24em] text-slate-200/80">
              <span>Created {formatDate(run.createdAt)}</span>
              <span>Started {formatDate(run.startedAt)}</span>
              <span>Finished {formatDate(run.finishedAt)}</span>
            </div>
          </div>

          <div className="space-y-3 text-right">
            <StatusPill status={run.status} />
            <div className="flex flex-wrap justify-end gap-2">
              <button
                onClick={() => downloadExport("csv")}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Export CSV
              </button>
              <button
                onClick={() => downloadExport("json")}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Export JSON
              </button>
              <Link
                href={`/projects/${run.projectId}`}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                View project
              </Link>
            </div>
          </div>
        </div>

        {run.warningCount > 0 ? (
          <div className="mt-6 rounded-[28px] border border-amber-200/20 bg-amber-100/10 p-4 text-sm text-amber-100">
            <p className="font-semibold">Coverage note</p>
            <ul className="mt-2 space-y-2 text-sm leading-6">
              {run.warnings.slice(0, 4).map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.36fr_0.64fr]">
        <div className="space-y-6">
          <div className="rounded-[30px] border border-slate-200 bg-white/92 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Current filters</p>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
                  Min rating
                </span>
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  value={filters.minRating}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      minRating: Number(event.target.value),
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
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  value={filters.minReviewCount}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      minReviewCount: Number(event.target.value),
                    }))
                  }
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
                  Website filter
                </span>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  value={filters.websiteMode}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      websiteMode: event.target.value as SearchFilters["websiteMode"],
                    }))
                  }
                >
                  <option value="missing">Missing website only</option>
                  <option value="any">Any website status</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
                  Sort
                </span>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  value={sortMode}
                  onChange={(event) =>
                    setSortMode(event.target.value as "reviews" | "rating" | "alpha")
                  }
                >
                  <option value="reviews">Most reviews</option>
                  <option value="rating">Highest rating</option>
                  <option value="alpha">Alphabetical</option>
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white/92 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Coverage snapshot</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Raw candidates</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{formatNumber(run.results.length)}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-amber-700">Filtered matches</p>
                <p className="mt-2 text-3xl font-semibold text-amber-950">
                  {formatNumber(filteredResults.length)}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-500">{attributionText}</p>
          </div>
        </div>

        <div className="space-y-6">
          <MapCanvas
            center={{ lat: run.config.centerLat, lng: run.config.centerLng }}
            results={filteredResults}
          />

          <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white/92 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Qualified results</p>
                <p className="mt-1 text-sm text-slate-500">
                  {filteredResults.length} businesses match the current filter state.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-medium">Business</th>
                    <th className="px-5 py-4 font-medium">Rating</th>
                    <th className="px-5 py-4 font-medium">Reviews</th>
                    <th className="px-5 py-4 font-medium">Website</th>
                    <th className="px-5 py-4 font-medium">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((place) => (
                    <tr key={place.placeId} className="border-t border-slate-100 align-top">
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-950">{place.displayName}</p>
                          <p className="max-w-xl text-sm leading-6 text-slate-500">
                            {place.formattedAddress}
                          </p>
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                            {place.primaryType ?? "Unknown type"}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {place.rating ? place.rating.toFixed(1) : "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {formatNumber(place.userRatingCount)}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {place.websiteUri ? (
                          <a
                            href={place.websiteUri}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-700 underline decoration-sky-300 underline-offset-4"
                          >
                            Website
                          </a>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-900">
                            Missing
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <a
                          href={place.googleMapsUri}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-sky-700 underline decoration-sky-300 underline-offset-4"
                        >
                          Open in Maps
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredResults.length === 0 ? (
                <div className="px-5 py-12 text-center text-sm text-slate-500">
                  No businesses match the current filters yet.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
