# Architecture

## App shape

The app is split into four main layers:

1. `src/app`: Next.js App Router pages and route handlers
2. `src/components`: client UI for run creation and result review
3. `src/server`: Prisma access, Google Places integration, search planning, exports, and queue execution
4. `prisma`: schema and Prisma configuration

## Search pipeline

Each search run follows the same flow:

1. A project and `SearchRun` record are created.
2. A cost estimate is computed from radius, presets, and keywords.
3. The run is queued through BullMQ, or processed inline when `QUEUE_INLINE=true` or Redis is absent.
4. Nearby Search is executed per Google type across seed tiles.
5. Saturated tiles are recursively split until the minimum tile size is reached.
6. Optional keyword searches run through Text Search for supplemental coverage.
7. Results are deduped by Place ID, written to `RunPlace`, and linked to persistent `PlaceReference` rows.

## Data model

- `Project`: long-lived saved workspace and last config
- `SearchRun`: individual execution record, cost estimate, status, warnings, timestamps
- `PlaceReference`: durable record of discovered Place IDs
- `RunPlace`: TTL-bound place snapshot used for UI review and exports

## Worker model

- `src/server/queue.ts` provides queue access and inline fallback
- `src/server/worker.ts` runs the BullMQ worker process
- `src/app/api/internal/jobs/run-search/route.ts` is available for internal/manual execution

## Frontend flow

- `/` creates a project and launches runs
- `/projects/[id]` shows saved runs and last config
- `/runs/[id]` renders the Google map workspace, local filters, and export actions
