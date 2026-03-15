"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Calendar, TrendingUp } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getUsersGrowth } from "@/lib/adminApi";

interface GrowthData {
  label: string;
  users: number;
  growth_pct: number;
}

interface Props {
  data: GrowthData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const growth = payload[0].payload.growth_pct ?? 0;

    return (
      <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
        <p className="text-xs text-muted-foreground">{label}</p>

        <p className="text-sm text-muted-foreground">Total Users</p>

        <div className="mt-1 flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground">{value}</span>

          <span className="flex items-center gap-1 text-xs text-green-600">
            <TrendingUp className="h-3 w-3" />
            {growth}%
          </span>
        </div>
      </div>
    );
  }

  return null;
};

export function UserGrowthChart({ data }: Props) {
  const [period, setPeriod] = useState("month");

  const { yDomain, yTicks } = useMemo(() => {
    if (!data.length) {
      return { yDomain: [0, 100], yTicks: [0, 25, 50, 75, 100] };
    }

    const max = Math.max(...data.map((d) => d.users));

    const roundedMax = Math.ceil(max / 100) * 100;

    return {
      yDomain: [0, roundedMax],
      yTicks: [
        0,
        roundedMax * 0.25,
        roundedMax * 0.5,
        roundedMax * 0.75,
        roundedMax,
      ],
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="h-72 flex items-center justify-center text-muted-foreground">
          Loading chart...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Total Users</h3>

          <p className="text-sm text-muted-foreground">
            Monthly total users growth
          </p>
        </div>

        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32 gap-2 border-border">
            <Calendar className="h-4 w-4 text-muted-foreground" />

            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(262, 83%, 58%)"
                  stopOpacity={0.3}
                />

                <stop
                  offset="100%"
                  stopColor="hsl(262, 83%, 58%)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(220, 9%, 46%)", fontSize: 12 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(220, 9%, 46%)", fontSize: 12 }}
              dx={-10}
              domain={yDomain}
              ticks={yTicks}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="users"
              stroke="hsl(262, 83%, 58%)"
              strokeWidth={2}
              fill="url(#userGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
