import Link from "next/link"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-5 py-12">
      <div className="rounded-[36px] border border-slate-200 bg-white/92 p-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <p className="text-sm uppercase tracking-[0.32em] text-slate-500">404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
          That page does not exist.
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-500">
          Head back to the console to create a new prospecting run or open a saved project.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Return home
        </Link>
      </div>
    </main>
  )
}
