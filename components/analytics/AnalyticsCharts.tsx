"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Search, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModelUsageBreakdown } from "./ModelUsageBreakdown"; // ← ganti TopUserLocations
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
import {
  getAnalyticsEngagementTrend,
  getAnalyticsUsers,
} from "@/lib/adminApi";

type SortKey = "name" | "chats" | "tokens";
type SortDir = "asc" | "desc";

interface UserRow {
  id: string;
  name: string;
  email: string;
  chats: number;
  tokens: number;
  status: "Active" | "Banned";
}

interface Props {
  maxChats?: number;
}

export function AnalyticsCharts({ maxChats = 1 }: Props) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("chats");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Banned">("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [trendData, setTrendData] = useState<{ name: string; value: number }[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingTrend, setLoadingTrend] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch engagement trend
  useEffect(() => {
    setLoadingTrend(true);
    getAnalyticsEngagementTrend()
      .then(setTrendData)
      .catch(console.error)
      .finally(() => setLoadingTrend(false));
  }, []);

  // Fetch users table
  const fetchUsers = useCallback(() => {
    setLoadingUsers(true);
    getAnalyticsUsers({
      page,
      limit: perPage,
      search: debouncedSearch,
      status: statusFilter,
    })
      .then((res) => {
        setUsers(res.data);
        setTotalUsers(res.total);
      })
      .catch(console.error)
      .finally(() => setLoadingUsers(false));
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset page on filter/search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const totalPages = Math.ceil(totalUsers / perPage);
  const topChats = Math.max(...users.map((u) => u.chats), 1);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    let diff = 0;
    if (sortKey === "name") diff = a.name.localeCompare(b.name);
    else if (sortKey === "chats") diff = a.chats - b.chats;
    else if (sortKey === "tokens") diff = a.tokens - b.tokens;
    return sortDir === "asc" ? diff : -diff;
  });

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp className={cn("h-3 w-3", sortKey === col && sortDir === "asc" ? "text-primary" : "text-muted-foreground/40")} />
      <ChevronDown className={cn("h-3 w-3 -mt-1", sortKey === col && sortDir === "desc" ? "text-primary" : "text-muted-foreground/40")} />
    </span>
  );

  const formatTokens = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Engagement Trend Line Chart */}
      <Card className="border-border bg-card lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-semibold">User Engagement Trends</CardTitle>
            <p className="text-sm text-muted-foreground">Monthly active users (last 7 months)</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Calendar className="h-3 w-3" />
            Month
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          {loadingTrend ? (
            <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
              Loading chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  formatter={(v: number) => [v, "Active Users"]}
                />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Model Usage Breakdown — replaces TopUserLocations */}
      <ModelUsageBreakdown />

      {/* User Analytics Table */}
      <div className="lg:col-span-3">
        <Card className="border-border bg-card">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">User Analytics Overview</CardTitle>
                <p className="text-sm text-muted-foreground">{totalUsers} users · based on current period</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search user..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 w-44 rounded-md border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex rounded-md border border-border overflow-hidden text-xs">
                  {(["all", "Active", "Banned"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setStatusFilter(f)}
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
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("chats")}>
                      <span className="inline-flex items-center">Chats <SortIcon col="chats" /></span>
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("tokens")}>
                      <span className="inline-flex items-center">Tokens <SortIcon col="tokens" /></span>
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-muted-foreground text-sm">Loading...</td>
                    </tr>
                  ) : sortedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-muted-foreground text-sm">No users found.</td>
                    </tr>
                  ) : (
                    sortedUsers.map((user) => {
                      const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
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
                          {/* Chats */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${Math.min((user.chats / topChats) * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-foreground">{user.chats}</span>
                            </div>
                          </td>
                          {/* Tokens */}
                          <td className="px-5 py-3.5 font-mono text-sm text-foreground">{formatTokens(user.tokens)}</td>
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
                Showing {totalUsers === 0 ? 0 : (page - 1) * perPage + 1}–{Math.min(page * perPage, totalUsers)} of {totalUsers} users
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                  ← Prev
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
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
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages || totalPages === 0}>
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