import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsStatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  iconBgColor: string;
}

export function AnalyticsStatCard({
  title,
  value,
  change,
  changeType,
  icon,
  iconBgColor,
}: AnalyticsStatCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", iconBgColor)}>
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
        <div className="mt-3 flex items-center justify-between text-sm">
          <span
            className={cn(
              "font-medium",
              changeType === "positive" && "text-success",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-primary"
            )}
          >
            {change}
          </span>
          <span className="text-muted-foreground">From The Last Month</span>
        </div>
      </CardContent>
    </Card>
  );
}
