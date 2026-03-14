import { clamp } from "@/lib/utils"

export type GeoPoint = {
  lat: number
  lng: number
}

export type SearchTile = {
  center: GeoPoint
  radiusMeters: number
  depth: number
}

const EARTH_RADIUS_METERS = 6_371_000
const MAX_TILE_RADIUS_METERS = 1_500
const MIN_TILE_RADIUS_METERS = 250

export function metersToDegreesLatitude(meters: number) {
  return meters / 111_320
}

export function metersToDegreesLongitude(meters: number, latitude: number) {
  const latitudeRadians = (latitude * Math.PI) / 180

  return meters / (111_320 * Math.cos(latitudeRadians))
}

export function distanceMeters(a: GeoPoint, b: GeoPoint) {
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const deltaLat = ((b.lat - a.lat) * Math.PI) / 180
  const deltaLng = ((b.lng - a.lng) * Math.PI) / 180

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

export function offsetPoint(center: GeoPoint, northMeters: number, eastMeters: number): GeoPoint {
  return {
    lat: center.lat + metersToDegreesLatitude(northMeters),
    lng: center.lng + metersToDegreesLongitude(eastMeters, center.lat),
  }
}

export function createSeedTiles(center: GeoPoint, radiusMeters: number) {
  if (radiusMeters <= MAX_TILE_RADIUS_METERS) {
    return [{ center, radiusMeters, depth: 0 }]
  }

  const tileRadius = clamp(radiusMeters / 2.4, 700, MAX_TILE_RADIUS_METERS)
  const verticalStep = tileRadius * 1.3
  const horizontalStep = tileRadius * 1.4
  const tiles: SearchTile[] = []

  for (let north = -radiusMeters; north <= radiusMeters; north += verticalStep) {
    for (let east = -radiusMeters; east <= radiusMeters; east += horizontalStep) {
      const candidate = offsetPoint(center, north, east)

      if (distanceMeters(center, candidate) <= radiusMeters + tileRadius * 0.45) {
        tiles.push({
          center: candidate,
          radiusMeters: tileRadius,
          depth: 0,
        })
      }
    }
  }

  return tiles.length > 0 ? tiles : [{ center, radiusMeters, depth: 0 }]
}

export function splitTile(tile: SearchTile) {
  const nextRadius = Math.max(Math.floor(tile.radiusMeters / 2), MIN_TILE_RADIUS_METERS)
  const offset = nextRadius * 0.85

  return [
    offsetPoint(tile.center, offset, -offset),
    offsetPoint(tile.center, offset, offset),
    offsetPoint(tile.center, -offset, -offset),
    offsetPoint(tile.center, -offset, offset),
  ].map((center) => ({
    center,
    radiusMeters: nextRadius,
    depth: tile.depth + 1,
  }))
}

export function canSplitTile(tile: SearchTile) {
  return tile.radiusMeters > MIN_TILE_RADIUS_METERS
}

export function estimateSeedTileCount(radiusMeters: number) {
  return createSeedTiles({ lat: 0, lng: 0 }, radiusMeters).length
}
