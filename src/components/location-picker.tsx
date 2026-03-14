"use client"

import { useEffect, useRef, useState } from "react"

import { loadGoogleMaps } from "@/lib/google-maps"

type LocationValue = {
  areaPlaceId: string
  areaLabel: string
  centerLat: number
  centerLng: number
}

type LocationPickerProps = {
  value: LocationValue
  onChange: (value: LocationValue) => void
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState("Load a Google Maps API key to use autocomplete.")
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""

  useEffect(() => {
    if (!apiKey || !inputRef.current) {
      return
    }

    let cancelled = false

    loadGoogleMaps(apiKey)
      .then((google) => {
        if (cancelled || !inputRef.current || !google?.maps) {
          if (!google?.maps) {
            setStatus("Google Maps loaded without the expected maps runtime.")
          }

          return
        }

        const maps = google.maps
        const autocomplete = new maps.places.Autocomplete(inputRef.current, {
          fields: ["place_id", "formatted_address", "geometry", "name"],
          types: ["geocode"],
        })

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace()
          const lat = place.geometry?.location?.lat?.()
          const lng = place.geometry?.location?.lng?.()

          if (!place.place_id || lat === undefined || lng === undefined) {
            setStatus("Google Maps returned a place without coordinates.")

            return
          }

          onChange({
            areaPlaceId: place.place_id,
            areaLabel: place.formatted_address || place.name || value.areaLabel,
            centerLat: lat,
            centerLng: lng,
          })
          setStatus("Autocomplete ready. Select a city, district, or address.")
        })

        setStatus("Autocomplete ready. Select a city, district, or address.")
      })
      .catch((error) => {
        setStatus(error instanceof Error ? error.message : "Unable to load Google Maps.")
      })

    return () => {
      cancelled = true
    }
  }, [apiKey, onChange, value.areaLabel])

  return (
    <div className="space-y-3 rounded-[28px] border border-white/10 bg-slate-950/65 p-5 shadow-[0_18px_70px_rgba(15,23,42,0.28)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-100">Target area</p>
          <p className="mt-1 text-sm text-slate-400">
            Pick a city or address, or enter the map center manually.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-300">
          Places Autocomplete
        </span>
      </div>

      <label className="block">
        <span className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
          Search area
        </span>
        <input
          ref={inputRef}
          className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-amber-300/70"
          placeholder="Paris 11e, Brooklyn, 75008, 221B Baker Street..."
          defaultValue={value.areaLabel}
          onChange={(event) =>
            onChange({
              ...value,
              areaLabel: event.target.value,
              areaPlaceId: value.areaPlaceId || "manual-entry",
            })
          }
        />
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
            Latitude
          </span>
          <input
            type="number"
            step="0.000001"
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-amber-300/70"
            value={Number.isFinite(value.centerLat) ? value.centerLat : ""}
            onChange={(event) =>
              onChange({
                ...value,
                centerLat: Number(event.target.value),
                areaPlaceId: value.areaPlaceId || "manual-entry",
              })
            }
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
            Longitude
          </span>
          <input
            type="number"
            step="0.000001"
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-amber-300/70"
            value={Number.isFinite(value.centerLng) ? value.centerLng : ""}
            onChange={(event) =>
              onChange({
                ...value,
                centerLng: Number(event.target.value),
                areaPlaceId: value.areaPlaceId || "manual-entry",
              })
            }
          />
        </label>
      </div>

      <p className="text-xs leading-6 text-slate-400">{status}</p>
    </div>
  )
}
