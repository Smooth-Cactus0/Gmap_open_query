# Launch V1

This guide shows the minimum setup needed to run Prospecting Console locally and start testing real searches.

## 1. What you need

- Node.js 22+ or 24+
- Docker Desktop
- A Google Cloud project with billing enabled
- A PostgreSQL database
- A Redis instance

For local development, the included Docker Compose file gives you PostgreSQL and Redis.

## 2. Enable the Google APIs

In Google Cloud Console, enable:

- Places API
- Maps JavaScript API

Then create an API key that can be used for server-side Places requests and browser-side map loading.

For local testing, you can use the same key in both variables below. Later, you may want to separate them.

## 3. Create your local `.env`

Create a `.env` file in the project root from `.env.example`.

Minimum working values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/google_prospecting?schema=public"
REDIS_URL="redis://localhost:6379"
GOOGLE_MAPS_API_KEY="your_real_google_api_key"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_real_google_api_key"
GOOGLE_MAPS_ATTRIBUTION_TEXT="Powered by Google Maps"
RESULT_TTL_DAYS="30"
QUEUE_INLINE="false"
INTERNAL_JOB_SECRET="change-me"
```

## 4. Start the local services

Run:

```bash
docker compose up -d db redis
```

This starts:

- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

## 5. Install dependencies and prepare the database

Run:

```bash
npm install
npm run prisma:generate
npm run db:push
```

`db:push` creates the V1 schema in Postgres.

## 6. Start the app

In one terminal:

```bash
npm run dev
```

In a second terminal:

```bash
npm run worker
```

Then open:

```text
http://localhost:3000
```

## 7. First test flow

1. Enter a project name.
2. Choose a city or address.
3. Set a radius.
4. Select one or more business presets.
5. Optionally add keyword queries.
6. Set filters such as:
   - `min rating`
   - `min reviews`
   - `missing website only`
7. Launch the run.
8. Open the run page and inspect the map and table results.

## 8. If you want the simplest possible local mode

If you do not want to run the worker during early testing, set:

```env
QUEUE_INLINE="true"
```

Then only run:

```bash
npm run dev
```

The search job will execute inline in the web process.

## 9. Common reasons it may not work yet

- Google billing is not enabled
- The Places API is not enabled
- The Maps JavaScript API is not enabled
- The API key restrictions block localhost usage
- PostgreSQL is not running
- Redis is not running while `QUEUE_INLINE=false`
- `.env` was created but the dev server was not restarted

## 10. Recommended first real tests

- A small radius in a low-density area
- A medium radius in a dense city area
- A query with only presets
- A query with presets plus keywords
- A `missing website only` run with a higher review threshold
