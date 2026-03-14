import { cn } from "@/lib/utils"

type StatusPillProps = {
  status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED"
}

const statusStyles: Record<StatusPillProps["status"], string> = {
  QUEUED: "border-amber-400/40 bg-amber-100 text-amber-900",
  RUNNING: "border-sky-400/40 bg-sky-100 text-sky-900",
  SUCCEEDED: "border-emerald-400/40 bg-emerald-100 text-emerald-900",
  FAILED: "border-rose-400/40 bg-rose-100 text-rose-900",
}

export function StatusPill({ status }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.24em]",
        statusStyles[status],
      )}
    >
      {status}
    </span>
  )
}
