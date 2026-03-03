"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Search, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopUserLocations } from "./TopUserLocations";
import { cn } from "@/lib/utils";
import {
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

// Analytics user data — matched with stat cards (284 total users)
const analyticsUsers = [
  { id: 1, name: "Bahlil Lahadalia", email: "bahlil@gmail.com", country: "Indonesia", chats: 128, tokens: "24.3K", status: "Active", growth: 12.4 },
  { id: 2, name: "Olivia Anderson", email: "olivia.anderson@gmail.com", country: "USA", chats: 95, tokens: "18.2K", status: "Active", growth: 8.1 },
  { id: 3, name: "Ahmad Dhani", email: "ahmad.dhani@yahoo.com", country: "Indonesia", chats: 74, tokens: "14.1K", status: "Active", growth: 5.3 },
  { id: 4, name: "Sarah Wilson", email: "sarah.w@gmail.com", country: "UK", chats: 210, tokens: "42.1K", status: "Banned", growth: -3.2 },
  { id: 5, name: "Michael Chen", email: "m.chen@outlook.com", country: "Singapore", chats: 156, tokens: "29.7K", status: "Active", growth: 19.8 },
  { id: 6, name: "Emma Davis", email: "emma.davis@yahoo.com", country: "Australia", chats: 78, tokens: "15.3K", status: "Active", growth: 6.7 },
  { id: 7, name: "David Martinez", email: "david.m@gmail.com", country: "Mexico", chats: 189, tokens: "35.8K", status: "Active", growth: 14.2 },
  { id: 8, name: "Lisa Thompson", email: "lisa.t@example.com", country: "Canada", chats: 34, tokens: "6.2K", status: "Banned", growth: -8.5 },
  { id: 9, name: "Raisa Andriana", email: "raisa@gmail.com", country: "Indonesia", chats: 167, tokens: "31.4K", status: "Active", growth: 22.1 },
  { id: 10, name: "Sophie Taylor", email: "sophie.taylor@outlook.com", country: "UK", chats: 92, tokens: "17.6K", status: "Banned", growth: -1.9 },
  { id: 11, name: "James Brown", email: "james.brown@gmail.com", country: "USA", chats: 110, tokens: "20.8K", status: "Active", growth: 9.3 },
  { id: 12, name: "Atta Halilintar", email: "atta@gmail.com", country: "Indonesia", chats: 203, tokens: "38.5K", status: "Active", growth: 31.7 },
  { id: 13, name: "Raffi Ahmad", email: "raffi@outlook.com", country: "Indonesia", chats: 88, tokens: "16.7K", status: "Active", growth: 4.5 },
  { id: 14, name: "Chelsea Islan", email: "chelsea@yahoo.com", country: "Indonesia", chats: 143, tokens: "27.1K", status: "Active", growth: 11.0 },
  { id: 15, name: "Nicholas Saputra", email: "nicholas@gmail.com", country: "Indonesia", chats: 61, tokens: "11.6K", status: "Banned", growth: -5.4 },
];

type SortKey = "name" | "chats" | "tokens" | "growth";
type SortDir = "asc" | "desc";

export function AnalyticsCharts() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("chats");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Banned">("all");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = analyticsUsers
    .filter((u) => {
      const q = search.toLowerCase();
      const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.country.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || u.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let diff = 0;
      if (sortKey === "name") diff = a.name.localeCompare(b.name);
      else if (sortKey === "chats") diff = a.chats - b.chats;
      else if (sortKey === "tokens") diff = parseFloat(a.tokens) - parseFloat(b.tokens);
      else if (sortKey === "growth") diff = a.growth - b.growth;
      return sortDir === "asc" ? diff : -diff;
    });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp className={cn("h-3 w-3", sortKey === col && sortDir === "asc" ? "text-primary" : "text-muted-foreground/40")} />
      <ChevronDown className={cn("h-3 w-3 -mt-1", sortKey === col && sortDir === "desc" ? "text-primary" : "text-muted-foreground/40")} />
    </span>
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Deal Trends Line Chart */}
      <Card className="border-border bg-card lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-semibold">User Engagement Trends</CardTitle>
            <p className="text-sm text-muted-foreground">Track monthly active user engagement rate</p>
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
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `${v}%`} ticks={[0, 25, 50, 75, 100]} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(v: number) => [`${v}%`, "Engagement Rate"]} />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: "hsl(var(--primary))" }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top User Locations Map */}
      <TopUserLocations />

      {/* User Analytics Table */}
      <div className="lg:col-span-3">
        <Card className="border-border bg-card">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">User Analytics Overview</CardTitle>
                <p className="text-sm text-muted-foreground">{filtered.length} users · based on current period</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search user..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="h-8 w-44 rounded-md border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex rounded-md border border-border overflow-hidden text-xs">
                  {(["all", "Active", "Banned"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => { setStatusFilter(f); setPage(1); }}
                      className={cn(
                        "px-3 py-1.5 font-medium transition-colors",
                        statusFilter === f
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {f === "all" ? "All" : f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">User</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Country</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("chats")}>
                      <span className="inline-flex items-center">Chats <SortIcon col="chats" /></span>
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("tokens")}>
                      <span className="inline-flex items-center">Tokens <SortIcon col="tokens" /></span>
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("growth")}>
                      <span className="inline-flex items-center">Growth <SortIcon col="growth" /></span>
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-muted-foreground text-sm">No users found.</td>
                    </tr>
                  ) : (
                    paginated.map((user) => {
                      const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
                      const isPositive = user.growth >= 0;
                      return (
                        <tr key={user.id} className="transition-colors hover:bg-muted/20">
                          {/* User */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                {initials}
                              </div>
                              <div>
                                <p className="font-medium text-foreground leading-none">{user.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          {/* Country */}
                          <td className="px-5 py-3.5 text-sm text-muted-foreground">{user.country}</td>
                          {/* Chats */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${Math.min((user.chats / 220) * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-foreground">{user.chats}</span>
                            </div>
                          </td>
                          {/* Tokens */}
                          <td className="px-5 py-3.5 font-mono text-sm text-foreground">{user.tokens}</td>
                          {/* Growth */}
                          <td className="px-5 py-3.5">
                            <span className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                              isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                            )}>
                              {isPositive ? "▲" : "▼"} {Math.abs(user.growth)}%
                            </span>
                          </td>
                          {/* Status */}
                          <td className="px-5 py-3.5">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                              user.status === "Active"
                                ? "bg-success/10 text-success"
                                : "bg-destructive/10 text-destructive"
                            )}>
                              <span className={cn("h-1.5 w-1.5 rounded-full", user.status === "Active" ? "bg-success" : "bg-destructive")} />
                              {user.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <p className="text-xs text-muted-foreground">
                Showing {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length} users
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                  ← Prev
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "ghost"}
                    size="sm"
                    className={cn("h-7 w-7 p-0 text-xs", p === page && "bg-primary text-primary-foreground")}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
                  Next →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
