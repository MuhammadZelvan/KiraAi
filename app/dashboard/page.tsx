import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { UserGrowthChart } from "@/components/dashboard/UserGrowthChart";
import { UserLoginTable } from "@/components/dashboard/UserLoginTable";

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome Back, Admin
          </h1>
          <p className="text-muted-foreground">
            Here's a quick overview of your business performance!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Users" value="984" change={15.8} />
          <StatCard title="New Users" value="540" change={-15.8} />
          <StatCard title="Active Users" value="540" change={15.8} />
          <StatCard title="Revenue" value="540" change={-15.8} />
        </div>

        {/* Chart */}
        <UserGrowthChart />

        {/* Table */}
        <UserLoginTable />
      </div>
    </DashboardLayout>
  );
}
