import {
  Info,
  MoreVertical,
  TrendingUp,
  TrendingDown
} from "lucide-react"

import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: number | string
  change?: number
  changeLabel?: string
}

function formatNumber(value: number | string) {
  if (typeof value === "number") {
    return value.toLocaleString()
  }
  return value
}

export function StatCard({
  title,
  value,
  change = 0,
  changeLabel = "Compared to last month"
}: StatCardProps) {

  const isPositive = change >= 0

  return (

    <div className="rounded-xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover">

      <div className="mb-4 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>

          <Info className="h-4 w-4 text-muted-foreground/60" />

        </div>

        <button className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">

          <MoreVertical className="h-4 w-4" />

        </button>

      </div>

      <div className="flex items-baseline gap-3">

        <span className="text-3xl font-bold text-foreground">
          {formatNumber(value)}
        </span>

        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
            isPositive
              ? "bg-green-500/10 text-green-600"
              : "bg-red-500/10 text-red-600"
          )}
        >

          {isPositive
            ? <TrendingUp className="h-3 w-3" />
            : <TrendingDown className="h-3 w-3" />
          }

          {isPositive ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%

        </span>

      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        {changeLabel}
      </p>

    </div>

  )

}