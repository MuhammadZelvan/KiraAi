"use client";

import { useState, useMemo } from "react";
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

// Dummy data untuk setiap periode
const weekData = [
  { label: "Mon", users: 120 },
  { label: "Tue", users: 135 },
  { label: "Wed", users: 148 },
  { label: "Thu", users: 142 },
  { label: "Fri", users: 165 },
  { label: "Sat", users: 178 },
  { label: "Sun", users: 155 },
];

const monthData = [
  { label: "Jan", users: 380 },
  { label: "Feb", users: 420 },
  { label: "Mar", users: 450 },
  { label: "Apr", users: 420 },
  { label: "May", users: 480 },
  { label: "Jun", users: 520 },
  { label: "Jul", users: 490 },
  { label: "Aug", users: 530 },
  { label: "Sep", users: 560 },
  { label: "Oct", users: 590 },
  { label: "Nov", users: 620 },
  { label: "Dec", users: 650 },
];

const yearData = [
  { label: "2019", users: 2400 },
  { label: "2020", users: 3200 },
  { label: "2021", users: 4100 },
  { label: "2022", users: 5300 },
  { label: "2023", users: 6800 },
  { label: "2024", users: 8200 },
  { label: "2025", users: 9500 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-muted-foreground">User Growth</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground">
            {payload[0].value}
          </span>
          <span className="flex items-center gap-1 text-xs text-success">
            <TrendingUp className="h-3 w-3" />
            2.1%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function UserGrowthChart() {
  const [period, setPeriod] = useState("month");

  // Get data based on selected period
  const { data, yDomain, yTicks, description } = useMemo(() => {
    switch (period) {
      case "week":
        return {
          data: weekData,
          yDomain: [0, 200],
          yTicks: [0, 50, 100, 150, 200],
          description: "Weekly total users growth",
        };
      case "year":
        return {
          data: yearData,
          yDomain: [0, 10000],
          yTicks: [0, 2500, 5000, 7500, 10000],
          description: "Yearly total users growth",
        };
      default: // month
        return {
          data: monthData,
          yDomain: [0, 800],
          yTicks: [0, 200, 400, 600, 800],
          description: "Monthly total users growth",
        };
    }
  }, [period]);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Total Users</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32 gap-2 border-border">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="year">Year</SelectItem>
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
                <stop offset="0%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.05} />
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
