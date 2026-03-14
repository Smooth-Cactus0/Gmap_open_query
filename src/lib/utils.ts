export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "—"
  }

  return new Intl.NumberFormat("en-US").format(value)
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "—"
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
