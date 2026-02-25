"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AnalyticsStatCard } from "@/components/analytics/AnalyticsStatCard";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, UserX, MessageCircle, Upload } from "lucide-react";
import { exportToCSV, generateSampleAnalyticsData } from "@/lib/exportUtils";
import { useToast } from "@/components/ui/use-toast";

export default function AnalyticsPage() {
    const { toast } = useToast();

    const handleExport = () => {
        try {
            // Generate sample data (replace with real data from API/state)
            const analyticsData = generateSampleAnalyticsData();

            // Export to CSV
            exportToCSV(analyticsData);

            // Show success toast
            toast({
                title: "Export Successful",
                description: "Analytics data has been exported to CSV file.",
            });
        } catch (error) {
            toast({
                title: "Export Failed",
                description: "Failed to export analytics data. Please try again.",
                variant: "destructive",
            });
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
                            Track and manage all customer orders efficiently.
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
                        value="284"
                        change="+ 22 product"
                        changeType="neutral"
                        icon={<Users className="h-6 w-6 text-primary" />}
                        iconBgColor="bg-primary/10"
                    />
                    <AnalyticsStatCard
                        title="Active Users"
                        value="64"
                        change="↑ 8%"
                        changeType="positive"
                        icon={<UserCheck className="h-6 w-6 text-success" />}
                        iconBgColor="bg-success/10"
                    />
                    <AnalyticsStatCard
                        title="Banned Users"
                        value="5"
                        change="↓ 3%"
                        changeType="negative"
                        icon={<UserX className="h-6 w-6 text-destructive" />}
                        iconBgColor="bg-destructive/10"
                    />
                    <AnalyticsStatCard
                        title="Total Chats Users"
                        value="14"
                        change="↑ 5%"
                        changeType="positive"
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
