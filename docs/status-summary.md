# Status Summary

This page is the fastest way to understand what is already in the repo and what still needs to happen before a polished public release.

![V1 Roadmap](./assets/roadmap-v1.svg)

## Progress Snapshot

```mermaid
pie title Project Progress Snapshot
  "Implemented foundation" : 65
  "Remaining product hardening" : 20
  "Operational setup" : 10
  "Public release prep" : 5
```

## Delivery Board

```mermaid
flowchart LR
  A[Product foundation] -->|Done| B[Search pipeline]
  B -->|Done| C[Core UI]
  C -->|Done| D[Persistence and exports]
  D -->|Next| E[Real API-key / DB validation]
  E -->|Next| F[UX polish and edge-case handling]
  F -->|Next| G[OSS release prep]
```

## What Is Done

- App foundation is in place with Next.js, Prisma 7, PostgreSQL, Redis, BullMQ, Tailwind, Docker, and repo docs.
- Search creation works conceptually end to end:
  - area selection inputs
  - radius-based searches
  - business presets plus keyword query
  - rating / review count / missing website filters
- Google Places orchestration is implemented:
  - Nearby Search per type
  - Text Search as a supplemental pass
  - adaptive tile splitting in saturated areas
  - deduping by Place ID
- Data persistence is implemented:
  - `Project`
  - `SearchRun`
  - `PlaceReference`
  - TTL-based `RunPlace`
- Review workflow is implemented:
  - home dashboard
  - project detail page
  - run detail workspace
  - Google map + results table
  - CSV / JSON export
- Engineering baseline is in good shape:
  - `lint` passes
  - `test` passes
  - production `build` passes

## What Is Left

```mermaid
kanban
  title Remaining Work
  section Validate in real environment
    Start Postgres and Redis
    Add live Google Maps API keys
    Run first real search end to end
    Confirm Place field masks and billing behavior
  section Improve product quality
    Better empty / loading / failure states
    Refine autocomplete UX and map interactions
    Add retry / cancellation / rerun controls
    Improve result-table sorting and pagination
  section Harden backend
    Add quotas, throttling, and backoff tuning
    Add structured logging around worker jobs
    Add better job monitoring and stale-run recovery
    Add purge scheduling beyond request-triggered cleanup
  section Prepare OSS release
    Add screenshots and demo GIFs
    Add CONTRIBUTING guide and issue templates
    Re-check Google terms before publishing
    Choose first public release tag and changelog
```

## Recommended Next Steps

1. Validate the app against a real `DATABASE_URL`, `REDIS_URL`, and Google Maps API key.
2. Run two or three real searches in low-density and high-density areas to evaluate result coverage and API cost.
3. Tighten UX around queued/running/failed states so the product feels solid before public screenshots.
4. Add repo polish for GitHub: screenshots, contribution docs, and a first release checklist.

## Release Readiness Checklist

- [x] Greenfield app scaffolded
- [x] Core data model implemented
- [x] Search orchestration implemented
- [x] Primary UI routes implemented
- [x] Export flow implemented
- [x] Docker and environment docs added
- [x] Lint, tests, and production build passing
- [ ] Real environment smoke test completed
- [ ] API cost / quota behavior observed with live keys
- [ ] UX polish pass completed
- [ ] Open-source release assets prepared
