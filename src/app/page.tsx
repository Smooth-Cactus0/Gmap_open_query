import { ProjectBuilder } from "@/components/project-builder";
import type { ProjectSummary, SearchRunSummary } from "@/lib/types";
import { getDashboardData } from "@/server/queries";

export default async function Home() {
  let dashboardData: {
    projects: ProjectSummary[]
    runs: SearchRunSummary[]
  } = {
    projects: [],
    runs: [],
  };
  let dbError = false

  try {
    dashboardData = await getDashboardData()
  } catch {
    dbError = true
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1520px] flex-col gap-10 px-5 py-8 md:px-8 md:py-10">
      <section className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.38em] text-slate-500">Google Places v1</p>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            A self-hosted prospecting console for identifying local businesses with strong reviews,
            weak web presence, and clear geographic fit.
          </p>
        </div>
        <div className="rounded-full border border-slate-300 bg-white/80 px-5 py-3 text-sm font-medium text-slate-700 shadow-sm backdrop-blur">
          Self-hosted • single-user • open-source ready
        </div>
      </section>

      {dbError ? (
        <section className="rounded-[28px] border border-amber-300/40 bg-amber-100/70 px-5 py-4 text-sm leading-6 text-amber-950">
          The UI is ready, but the database is not connected yet. Set `DATABASE_URL`, start Postgres,
          run `npm run db:push`, then refresh the page.
        </section>
      ) : null}

      <ProjectBuilder initialProjects={dashboardData.projects} initialRuns={dashboardData.runs} />
    </main>
  )
}
