"use client";

import { useEffect, useState } from "react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { UserGrowthChart } from "@/components/dashboard/UserGrowthChart";
import { UserLoginTable } from "@/components/dashboard/UserLoginTable";
import type { UserLogin } from "@/components/dashboard/UserLoginTable";

import {
  getDashboardOverview,
  getUsersGrowth,
  getLoginActivity,
} from "@/lib/adminApi";
import { useAutoRefresh } from "@/hooks/use-autorefresh";

/* ================================
 TYPES
================================ */

interface Overview {
  users_total: number;
  users_growth_pct: number;
  new_users_this_month: number;
  new_users_growth_pct: number;
  tokens_total: number;
  tokens_growth_pct: number;
  active_users?: number;
}

interface GrowthData {
  label: string;
  users: number;
  growth_pct: number;
}

/* ================================
 PAGE
================================ */

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [growth, setGrowth] = useState<GrowthData[]>([]);
  const [loginLogs, setLoginLogs] = useState<UserLogin[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchDashboard() {
    try {
      setError(null);

      const [overviewData, growthData, loginData] = await Promise.all([
        getDashboardOverview(),
        getUsersGrowth(),
        getLoginActivity(),
      ]);

      /* ================================
      OVERVIEW
      ================================ */

      setOverview(overviewData);

      /* ================================
      GROWTH CHART
      ================================ */

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const mappedGrowth: GrowthData[] = months.map((month, index) => {
        const row = growthData.find((r: any) => {
          const d = new Date(r.month);
          return d.getMonth() === index;
        });

        return {
          label: month,
          users: row?.users_total ?? 0,
          growth_pct: row?.growth_pct ?? 0,
        };
      });

      setGrowth(mappedGrowth);

      /* ================================
      LOGIN TABLE
      ================================ */

      const mappedLogs = loginData.data.map((row: any) => ({
        id: row.id,
        email: row.email,
        role: row.role ?? "User",
        loginMethod: row.method
          ? row.method.charAt(0).toUpperCase() + row.method.slice(1)
          : "Email",
        firstLogin: row.first_login,
        status:
          row.status === "success"
            ? "Success"
            : row.status === "failed"
              ? "Canceled"
              : "Pending",
      }));

      setLoginLogs(mappedLogs);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  /* ================================
  INITIAL LOAD
  ================================ */

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* ================================
  AUTO REFRESH (30s)
  ================================ */

  useAutoRefresh(fetchDashboard);

  /* ================================
  LOADING
  ================================ */

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 text-muted-foreground">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  /* ================================
  ERROR
  ================================ */

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 text-red-500">{error}</div>
      </DashboardLayout>
    );
  }

  if (!overview) {
    return (
      <DashboardLayout>
        <div className="p-6 text-muted-foreground">
          No dashboard data available.
        </div>
      </DashboardLayout>
    );
  }

  /* ================================
  PAGE UI
  ================================ */

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Welcome Back, Admin</h1>

          <p className="text-muted-foreground">
            Here's a quick overview of your business performance!
          </p>
        </div>

        {/* ================================
        STATS
        ================================ */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={overview.users_total}
            change={overview.users_growth_pct}
          />

          <StatCard
            title="New Users"
            value={overview.new_users_this_month}
            change={overview.new_users_growth_pct}
          />

          <StatCard
            title="Tokens Used"
            value={overview.tokens_total}
            change={overview.tokens_growth_pct}
          />

          <StatCard
            title="Active Users"
            value={overview.active_users ?? 0}
            change={0}
          />
        </div>

        {/* ================================
        USER GROWTH CHART
        ================================ */}

        <UserGrowthChart data={growth} />

        {/* ================================
        LOGIN TABLE
        ================================ */}

        <UserLoginTable data={loginLogs} />
      </div>
    </DashboardLayout>
  );
}
