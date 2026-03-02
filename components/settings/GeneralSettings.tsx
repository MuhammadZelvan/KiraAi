"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Globe,
    Clock,
    CalendarDays,
    LayoutGrid,
    Rows3,
    Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export function GeneralSettings() {
    const { toast } = useToast();

    const [language, setLanguage] = useState("en");
    const [timezone, setTimezone] = useState("Asia/Jakarta");
    const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
    const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
    const [dashboardName, setDashboardName] = useState("KiraAI Admin");
    const [autoRefresh, setAutoRefresh] = useState("30");

    const languages = [
        { value: "en", label: "English" },
        { value: "id", label: "Bahasa Indonesia" },
        { value: "ja", label: "日本語" },
        { value: "zh", label: "中文" },
    ];

    const timezones = [
        { value: "Asia/Jakarta", label: "Asia/Jakarta (WIB, UTC+7)" },
        { value: "Asia/Makassar", label: "Asia/Makassar (WITA, UTC+8)" },
        { value: "Asia/Jayapura", label: "Asia/Jayapura (WIT, UTC+9)" },
        { value: "Asia/Singapore", label: "Asia/Singapore (SGT, UTC+8)" },
        { value: "America/New_York", label: "America/New York (EST, UTC-5)" },
        { value: "Europe/London", label: "Europe/London (GMT, UTC+0)" },
    ];

    const dateFormats = [
        { value: "DD/MM/YYYY", label: "DD/MM/YYYY", example: "24/02/2026" },
        { value: "MM/DD/YYYY", label: "MM/DD/YYYY", example: "02/24/2026" },
        { value: "YYYY-MM-DD", label: "YYYY-MM-DD", example: "2026-02-24" },
        { value: "DD MMM YYYY", label: "DD MMM YYYY", example: "24 Feb 2026" },
    ];

    const handleSave = () => {
        toast({
            title: "Settings Saved",
            description: "General settings have been updated successfully.",
        });
    };

    const handleReset = () => {
        setLanguage("en");
        setTimezone("Asia/Jakarta");
        setDateFormat("DD/MM/YYYY");
        setDensity("comfortable");
        setDashboardName("KiraAI Admin");
        setAutoRefresh("30");
        toast({
            title: "Settings Reset",
            description: "General settings have been restored to defaults.",
        });
    };

    return (
        <div className="flex-1 space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-foreground">General</h2>
                <p className="text-sm text-muted-foreground">
                    Configure dashboard preferences and regional settings.
                </p>
            </div>

            {/* Dashboard Name */}
            <div className="space-y-4 border-t border-border pt-6">
                <div className="border-b border-border pb-2">
                    <h3 className="text-base font-semibold text-foreground">Dashboard Configuration</h3>
                    <p className="text-sm text-muted-foreground">Customize your dashboard identity.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Dashboard Name</label>
                    <Input
                        value={dashboardName}
                        onChange={(e) => setDashboardName(e.target.value)}
                        className="max-w-md"
                        placeholder="Enter dashboard name"
                    />
                    <p className="text-xs text-muted-foreground">This name appears in the sidebar header and browser tab.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Auto Refresh Interval</label>
                    <div className="flex items-center gap-2 max-w-md">
                        <Input
                            type="number"
                            value={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.value)}
                            className="w-24"
                            min="5"
                            max="300"
                        />
                        <span className="text-sm text-muted-foreground">seconds</span>
                    </div>
                    <p className="text-xs text-muted-foreground">How often dashboard data should automatically refresh. Min: 5s, Max: 300s.</p>
                </div>
            </div>

            {/* Language */}
            <div className="space-y-4">
                <div className="border-b border-border pb-2">
                    <h3 className="text-base font-semibold text-foreground">Regional Settings</h3>
                    <p className="text-sm text-muted-foreground">Language, timezone, and date format preferences.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        Language
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-w-md">
                        {languages.map((lang) => (
                            <button
                                key={lang.value}
                                onClick={() => setLanguage(lang.value)}
                                className={cn(
                                    "rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                                    language === lang.value
                                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                                        : "border-border bg-background text-foreground hover:bg-muted/50"
                                )}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Timezone
                    </label>
                    <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full max-w-md rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        {timezones.map((tz) => (
                            <option key={tz.value} value={tz.value}>
                                {tz.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        Date Format
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-w-md">
                        {dateFormats.map((df) => (
                            <button
                                key={df.value}
                                onClick={() => setDateFormat(df.value)}
                                className={cn(
                                    "rounded-lg border px-3 py-2.5 text-left transition-all",
                                    dateFormat === df.value
                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                        : "border-border bg-background hover:bg-muted/50"
                                )}
                            >
                                <p className="text-sm font-medium text-foreground">{df.label}</p>
                                <p className="text-[10px] text-muted-foreground">{df.example}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Display Density */}
            <div className="space-y-4">
                <div className="border-b border-border pb-2">
                    <h3 className="text-base font-semibold text-foreground">Display Density</h3>
                    <p className="text-sm text-muted-foreground">Control how compact the interface appears.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-md">
                    <button
                        onClick={() => setDensity("comfortable")}
                        className={cn(
                            "flex items-center gap-3 rounded-lg border p-4 transition-all",
                            density === "comfortable"
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border bg-background hover:bg-muted/50"
                        )}
                    >
                        <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                        <div className="text-left">
                            <p className="text-sm font-semibold text-foreground">Comfortable</p>
                            <p className="text-[10px] text-muted-foreground">More spacing</p>
                        </div>
                    </button>
                    <button
                        onClick={() => setDensity("compact")}
                        className={cn(
                            "flex items-center gap-3 rounded-lg border p-4 transition-all",
                            density === "compact"
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border bg-background hover:bg-muted/50"
                        )}
                    >
                        <Rows3 className="h-5 w-5 text-muted-foreground" />
                        <div className="text-left">
                            <p className="text-sm font-semibold text-foreground">Compact</p>
                            <p className="text-[10px] text-muted-foreground">Less spacing</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
                <Button variant="outline" onClick={handleReset}>Reset to Default</Button>
                <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={handleSave}>
                    <Save className="h-4 w-4" />
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
