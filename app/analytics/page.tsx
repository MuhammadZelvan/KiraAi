"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AnalyticsStatCard } from "@/components/analytics/AnalyticsStatCard";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, UserX, MessageCircle, Upload } from "lucide-react";
import { getAnalyticsOverview } from "@/lib/adminApi";
import { useToast } from "@/components/ui/use-toast";

interface Overview {
  total_users: number;
  total_users_growth: number;
  active_users: number;
  active_users_growth: number;
  banned_users: number;
  banned_users_growth: number;
  chat_users: number;
  chat_users_growth: number;
}

const formatGrowth = (n: number) => {
  if (n > 0) return `↑ ${n}%`;
  if (n < 0) return `↓ ${Math.abs(n)}%`;
  return `0%`;
};

const growthType = (n: number): "positive" | "negative" | "neutral" =>
  n > 0 ? "positive" : n < 0 ? "negative" : "neutral";

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsOverview()
      .then(setOverview)
      .catch(() =>
        toast({ title: "Failed to load overview", variant: "destructive" })
      )
      .finally(() => setLoading(false));
  }, []);

  // Auto refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      getAnalyticsOverview().then(setOverview).catch(console.error);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = async () => {
    try {
      const res = await fetch("http://localhost:4000/admin/analytics/users?limit=9999", {
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      const json = await res.json();

      const rows = [
        ["Name", "Email", "Chats", "Tokens", "Status"],
        ...json.data.map((u: any) => [u.name, u.email, u.chats, u.tokens, u.status]),
      ];

      const csv = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: "Export Successful", description: "Analytics data exported to CSV." });
    } catch {
      toast({ title: "Export Failed", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">
              Track and manage all user activity and engagement.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Upload className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AnalyticsStatCard
            title="Total Users"
            value={loading ? "—" : String(overview?.total_users ?? 0)}
            change={loading ? "—" : formatGrowth(overview?.total_users_growth ?? 0)}
            changeType={loading ? "neutral" : growthType(overview?.total_users_growth ?? 0)}
            icon={<Users className="h-6 w-6 text-primary" />}
            iconBgColor="bg-primary/10"
          />
          <AnalyticsStatCard
            title="Active Users (24h)"
            value={loading ? "—" : String(overview?.active_users ?? 0)}
            change={loading ? "—" : formatGrowth(overview?.active_users_growth ?? 0)}
            changeType={loading ? "neutral" : growthType(overview?.active_users_growth ?? 0)}
            icon={<UserCheck className="h-6 w-6 text-success" />}
            iconBgColor="bg-success/10"
          />
          <AnalyticsStatCard
            title="Banned Users"
            value={loading ? "—" : String(overview?.banned_users ?? 0)}
            change={loading ? "—" : formatGrowth(overview?.banned_users_growth ?? 0)}
            changeType={loading ? "neutral" : growthType(-(overview?.banned_users_growth ?? 0))}
            icon={<UserX className="h-6 w-6 text-destructive" />}
            iconBgColor="bg-destructive/10"
          />
          <AnalyticsStatCard
            title="Users With Chats"
            value={loading ? "—" : String(overview?.chat_users ?? 0)}
            change={loading ? "—" : formatGrowth(overview?.chat_users_growth ?? 0)}
            changeType={loading ? "neutral" : growthType(overview?.chat_users_growth ?? 0)}
            icon={<MessageCircle className="h-6 w-6 text-warning" />}
            iconBgColor="bg-warning/10"
          />
        </div>

        {/* Charts Section */}
        <AnalyticsCharts />
      </div>
    </DashboardLayout>
  );
}