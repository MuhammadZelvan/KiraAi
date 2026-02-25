"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";

type SettingsTab = "general" | "appearance" | "notification" | "security";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>("general");

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                    <p className="text-muted-foreground">
                        Configure your admin dashboard preferences and security.
                    </p>
                </div>

                {/* Content with Sidebar */}
                <div className="flex gap-8">
                    <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />

                    <div className="flex-1 rounded-lg border border-border bg-card p-6">
                        {activeTab === "general" && <GeneralSettings />}
                        {activeTab === "appearance" && <AppearanceSettings />}
                        {activeTab === "notification" && <NotificationSettings />}
                        {activeTab === "security" && <SecuritySettings />}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
