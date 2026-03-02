import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface UserStatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  iconBgColor: string;
}

export function UserStatCard({
  title,
  value,
  change,
  changeType,
  icon,
  iconBgColor,
}: UserStatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              iconBgColor
            )}
          >
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground">
          <Info className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span
          className={cn(
            "text-sm font-medium",
            changeType === "positive" && "text-success",
            changeType === "negative" && "text-destructive",
            changeType === "neutral" && "text-primary"
          )}
        >
          {change}
        </span>
        <span className="text-sm text-muted-foreground">From The Last Month</span>
      </div>
    </div>
  );
}
