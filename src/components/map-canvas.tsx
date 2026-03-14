"use client"

import { useEffect, useRef, useState } from "react"

import { loadGoogleMaps } from "@/lib/google-maps"
import type { PlaceResult } from "@/lib/types"

type MapCanvasProps = {
  center: { lat: number; lng: number }
  results: PlaceResult[]
}

type MarkerLike = {
  setMap?: (map: null) => void
}

type InfoWindowLike = {
  close?: () => void
  setContent: (html: string) => void
  open: (options: { anchor: unknown; map: unknown }) => void
}

export function MapCanvas({ center, results }: MapCanvasProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""
  const [message, setMessage] = useState(apiKey ? "Loading Google map..." : "")
  const fallbackMessage = !apiKey ? "Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to render the Google map." : message

  useEffect(() => {
    if (!apiKey) {
      return
    }

    if (!mapRef.current) {
      return
    }

    let markers: MarkerLike[] = []
    let infoWindow: InfoWindowLike | undefined

    loadGoogleMaps(apiKey)
      .then((google) => {
        if (!mapRef.current || !google?.maps) {
          if (!google?.maps) {
            setMessage("Google Maps loaded without the expected maps runtime.")
          }

          return
        }

        const maps = google.maps
        const map = new maps.Map(mapRef.current, {
          center,
          zoom: results.length > 0 ? 11 : 10,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            { featureType: "poi.business", stylers: [{ visibility: "on" }] },
            { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#d4f5d0" }] },
          ],
        })

        infoWindow = new maps.InfoWindow()
        markers.forEach((marker) => marker.setMap?.(null))
        markers = results.map((place) => {
          const marker = new maps.Marker({
            position: { lat: place.lat, lng: place.lng },
            map,
            title: place.displayName,
          })
          const currentInfoWindow = infoWindow

          if (!currentInfoWindow) {
            return marker
          }

          marker.addListener("click", () => {
            currentInfoWindow.setContent(
              `<div style="max-width:240px;padding:6px 8px">
                <strong>${place.displayName}</strong>
                <p style="margin:6px 0 0;color:#475569">${place.formattedAddress}</p>
              </div>`,
            )
            currentInfoWindow.open({ anchor: marker, map })
          })

          return marker
        })

        if (results.length > 0) {
          const bounds = new maps.LatLngBounds()
          results.forEach((place) => bounds.extend({ lat: place.lat, lng: place.lng }))
          map.fitBounds(bounds, 60)
        }

        setMessage(results.length === 0 ? "No matching places yet." : "")
      })
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : "Unable to load the Google map.")
      })

    return () => {
      markers.forEach((marker) => marker.setMap?.(null))
      infoWindow?.close?.()
    }
  }, [apiKey, center, results])

  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-[30px] border border-slate-200 bg-slate-100">
      <div ref={mapRef} className="absolute inset-0" />
      {fallbackMessage ? (
        <div className="absolute inset-x-6 bottom-6 rounded-2xl border border-slate-300 bg-white/92 px-4 py-3 text-sm text-slate-600 shadow-lg backdrop-blur">
          {fallbackMessage}
        </div>
      ) : null}
    </div>
  )
}
