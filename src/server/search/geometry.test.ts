import assert from "node:assert/strict"
import test from "node:test"

import {
  canSplitTile,
  createSeedTiles,
  distanceMeters,
  splitTile,
} from "@/server/search/geometry"

test("createSeedTiles returns a single tile for small radii", () => {
  const tiles = createSeedTiles({ lat: 48.8566, lng: 2.3522 }, 1200)

  assert.equal(tiles.length, 1)
  assert.equal(tiles[0]?.radiusMeters, 1200)
})

test("createSeedTiles expands into multiple tiles for wider searches", () => {
  const tiles = createSeedTiles({ lat: 48.8566, lng: 2.3522 }, 6000)

  assert.ok(tiles.length > 1)
})

test("splitTile creates four smaller tiles", () => {
  const [first] = createSeedTiles({ lat: 48.8566, lng: 2.3522 }, 4000)

  assert.ok(first)
  assert.equal(canSplitTile(first), true)

  const subTiles = splitTile(first)
  assert.equal(subTiles.length, 4)
  assert.ok(subTiles.every((tile) => tile.radiusMeters < first.radiusMeters))
})

test("distanceMeters returns zero for identical points", () => {
  assert.equal(distanceMeters({ lat: 1, lng: 1 }, { lat: 1, lng: 1 }), 0)
})
