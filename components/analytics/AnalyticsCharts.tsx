import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopUserLocations } from "./TopUserLocations";
import { TopUserLocations3D } from "./TopUserLocations3D";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const dealTrendsData = [
  { name: "Jan", value: 50 },
  { name: "Feb", value: 55 },
  { name: "Mar", value: 60 },
  { name: "Apr", value: 72 },
  { name: "May", value: 68 },
  { name: "Jun", value: 78 },
  { name: "Jul", value: 75 },
];

const propertyData = [
  { name: "Jan", luxury: 20, commercial: 30 },
  { name: "Feb", luxury: 25, commercial: 35 },
  { name: "Mar", luxury: 70, commercial: 85 },
  { name: "Apr", luxury: 30, commercial: 40 },
  { name: "May", luxury: 35, commercial: 45 },
  { name: "Jun", luxury: 40, commercial: 50 },
  { name: "Jul", luxury: 25, commercial: 35 },
];

const summaryData = [
  { value: 200, label: "Lorem Ipsum", color: "bg-primary" },
  { value: 55, label: "Lorem Ipsum", color: "bg-warning" },
  { value: 180, label: "Lorem Ipsum", color: "bg-muted" },
];

export function AnalyticsCharts() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Deal Trends Line Chart */}
      <Card className="border-border bg-card lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-semibold">Deal Trends</CardTitle>
            <p className="text-sm text-muted-foreground">Track monthly deal volume and performance</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Calendar className="h-3 w-3" />
            Month
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dealTrendsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
                ticks={[0, 25, 50, 75, 100]}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value}%`, 'Value']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top User Locations Map */}
      {/* 2D Version: */}
      <TopUserLocations />

      {/* 3D Globe Version: */}
      {/* <TopUserLocations3D /> */}

      {/* Property Insights Chart */}
      <Card className="border-border bg-card lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">Property Insights</CardTitle>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Track monthly performance by type</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-primary" />
                <span className="text-sm text-muted-foreground">Luxury</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-warning" />
                <span className="text-sm text-muted-foreground">Commercial</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Calendar className="h-3 w-3" />
              Month
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={propertyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                ticks={[0, 40, 80, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="luxury" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="commercial" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
