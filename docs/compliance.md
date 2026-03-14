# Compliance Notes

This repository is intentionally framed as a Google Places in-app qualification tool.

## Guardrails in the implementation

- The UI keeps Google Maps content inside a Google map + attributed results workspace.
- Place snapshots are stored with an expiration timestamp instead of indefinite warehousing.
- Projects and Place IDs can remain after result snapshots are purged.
- Exports are generated on demand and are not persisted on the server.
- v1 avoids reviews, photos, summaries, and phone enrichment.

## Operational reminders

- Confirm the current Google Maps Platform terms before publishing or deploying publicly.
- Re-check any EEA-specific terms if the billing account is in the EEA.
- Keep attribution visible in the map and any related result surfaces.
- Treat this repository as operator software, not a public Google-based directory or bulk mirror.
