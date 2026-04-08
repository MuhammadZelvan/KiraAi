"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { getAnalyticsModelUsage } from "@/lib/adminApi";

interface ModelUsageData {
  name: string;
  value: number; // number of chats / requests
  color: string;
}

// Fallback palette — tweak to match your brand
const PALETTE = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2, 217 91% 60%))",
  "hsl(var(--chart-3, 142 71% 45%))",
  "hsl(var(--chart-4, 38 92% 50%))",
  "hsl(var(--chart-5, 0 84% 60%))",
];

// ── Custom tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value, percent } = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-foreground">{name}</p>
      <p className="text-muted-foreground">
        {value.toLocaleString()} requests &nbsp;·&nbsp;
        <span className="text-foreground font-medium">
          {(percent * 100).toFixed(1)}%
        </span>
      </p>
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────────────────
export function ModelUsageBreakdown() {
  const [data, setData] = useState<ModelUsageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsModelUsage()
      .then((raw: { name: string; value: number }[]) =>
        setData(raw.map((d, i) => ({ ...d, color: PALETTE[i % PALETTE.length] })))
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Model Usage Breakdown</CardTitle>
        <p className="text-sm text-muted-foreground">Requests per model · current period</p>
      </CardHeader>

      <CardContent className="pt-2">
        {loading ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            Loading chart...
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            No data available.
          </div>
        ) : (
          <>
            {/* Pie chart */}
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <ul className="mt-3 space-y-2">
              {data.map((item) => {
                const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
                return (
                  <li key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-foreground font-medium truncate max-w-[120px]">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>{item.value.toLocaleString()}</span>
                      <span className="w-10 text-right font-semibold text-foreground">
                        {pct}%
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}