export type GoogleMapsAutocompletePlace = {
  place_id?: string
  formatted_address?: string
  name?: string
  geometry?: {
    location?: {
      lat?: () => number
      lng?: () => number
    }
  }
}

export type GoogleMapsRuntime = {
  maps?: {
    Map: new (
      element: HTMLElement,
      options: Record<string, unknown>,
    ) => {
      fitBounds: (bounds: unknown, padding?: number) => void
    }
    Marker: new (options: Record<string, unknown>) => {
      addListener: (eventName: string, callback: () => void) => void
      setMap?: (map: null) => void
    }
    InfoWindow: new () => {
      close?: () => void
      setContent: (html: string) => void
      open: (options: { anchor: unknown; map: unknown }) => void
    }
    LatLngBounds: new () => {
      extend: (point: { lat: number; lng: number }) => void
    }
    places: {
      Autocomplete: new (
        element: HTMLInputElement,
        options: Record<string, unknown>,
      ) => {
        addListener: (eventName: string, callback: () => void) => void
        getPlace: () => GoogleMapsAutocompletePlace
      }
    }
  }
}

declare global {
  interface Window {
    google?: GoogleMapsRuntime
    __googleMapsPromise?: Promise<GoogleMapsRuntime | undefined>
  }
}

export function loadGoogleMaps(apiKey: string, libraries: string[] = ["places"]) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser."))
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google)
  }

  if (window.__googleMapsPromise) {
    return window.__googleMapsPromise
  }

  window.__googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-google-maps-loader="true"]',
    )

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.google))
      existingScript.addEventListener("error", () =>
        reject(new Error("Failed to load Google Maps.")),
      )

      return
    }

    const script = document.createElement("script")
    const params = new URLSearchParams({
      key: apiKey,
      libraries: libraries.join(","),
      v: "weekly",
    })

    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`
    script.async = true
    script.defer = true
    script.dataset.googleMapsLoader = "true"
    script.onload = () => resolve(window.google)
    script.onerror = () => reject(new Error("Failed to load Google Maps."))

    document.head.appendChild(script)
  })

  return window.__googleMapsPromise
}
