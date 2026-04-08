"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor, PanelLeftClose, PanelLeft, Save, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export function AppearanceSettings() {
    const { toast }    = useToast();
    const { setTheme } = useTheme();
    const { setOpen }  = useSidebar();

    const [theme, setThemeState]               = useState<"light" | "dark" | "system">("dark");
    const [sidebarBehavior, setSidebarBehavior] = useState<"expanded" | "collapsed">("expanded");
    const [fontSize, setFontSize]              = useState<"small" | "medium" | "large">("medium");

    // ── Load saved prefs on mount ─────────────────────────────────────────────
    useEffect(() => {
        const savedTheme    = localStorage.getItem("admin_theme")           as "light" | "dark" | "system" | null;
        const savedFontSize = localStorage.getItem("admin_fontSize")        as "small" | "medium" | "large" | null;
        const savedSidebar  = localStorage.getItem("admin_sidebarBehavior") as "expanded" | "collapsed" | null;

        if (savedTheme)    { setThemeState(savedTheme); setTheme(savedTheme); }
        if (savedFontSize)   setFontSize(savedFontSize);
        if (savedSidebar)    setSidebarBehavior(savedSidebar);
    }, []);

    // ── Apply theme immediately on click ──────────────────────────────────────
    useEffect(() => { setTheme(theme); }, [theme]);

    // ── Apply sidebar immediately on click ────────────────────────────────────
    useEffect(() => { setOpen(sidebarBehavior === "expanded"); }, [sidebarBehavior]);

    const themes = [
        { value: "light"  as const, label: "Light",  icon: Sun,     description: "Light background with dark text" },
        { value: "dark"   as const, label: "Dark",   icon: Moon,    description: "Dark background, easier on eyes" },
        { value: "system" as const, label: "System", icon: Monitor, description: "Follows OS preference"            },
    ];

    const fontSizes = [
        { value: "small"  as const, label: "Small",  size: "13px" },
        { value: "medium" as const, label: "Medium", size: "14px" },
        { value: "large"  as const, label: "Large",  size: "16px" },
    ];

    const handleSave = () => {
        localStorage.setItem("admin_theme",           theme);
        localStorage.setItem("admin_fontSize",        fontSize);
        localStorage.setItem("admin_sidebarBehavior", sidebarBehavior);

        // Apply font size saat save
        const sizeMap = { small: "81.25%", medium: "87.5%", large: "100%" };
        document.documentElement.style.setProperty("--admin-fs", sizeMap[fontSize]);
        window.dispatchEvent(new Event("admin-appearance-changed"));

        toast({ title: "Appearance Updated", description: "Your appearance settings have been saved." });
    };

    const handleReset = () => {
        setThemeState("dark"); setTheme("dark");
        setSidebarBehavior("expanded"); setOpen(true);
        setFontSize("medium");

        localStorage.removeItem("admin_theme");
        localStorage.removeItem("admin_fontSize");
        localStorage.removeItem("admin_sidebarBehavior");

        document.documentElement.style.setProperty("--admin-fs", "87.5%");
        window.dispatchEvent(new Event("admin-appearance-changed"));

        toast({ title: "Appearance Reset", description: "Appearance settings restored to defaults." });
    };

    return (
        <div className="flex-1 space-y-8">
            <div>
                <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
                <p className="text-sm text-muted-foreground">Customize the look and feel of the dashboard.</p>
            </div>

            {/* Theme */}
            <div className="space-y-4 border-t border-border pt-6">
                <div className="border-b border-border pb-2">
                    <h3 className="text-base font-semibold text-foreground">Theme Mode</h3>
                    <p className="text-sm text-muted-foreground">Choose your preferred color scheme.</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {themes.map((t) => (
                        <button
                            key={t.value}
                            onClick={() => setThemeState(t.value)}
                            className={cn(
                                "flex flex-col items-center gap-3 rounded-lg border p-4 transition-all",
                                theme === t.value
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "border-border bg-background hover:bg-muted/50"
                            )}
                        >
                            <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", theme === t.value ? "bg-primary/10" : "bg-muted")}>
                                <t.icon className={cn("h-6 w-6", theme === t.value ? "text-primary" : "text-muted-foreground")} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-foreground">{t.label}</p>
                                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{t.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Font Size */}
            <div className="space-y-4">
                <div className="border-b border-border pb-2">
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Font Size
                    </h3>
                    <p className="text-sm text-muted-foreground">Adjust the base font size of the dashboard.</p>
                </div>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                    {fontSizes.map((fs) => (
                        <button
                            key={fs.value}
                            onClick={() => setFontSize(fs.value)}
                            className={cn(
                                "rounded-lg border px-3 py-2.5 text-center transition-all",
                                fontSize === fs.value
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "border-border bg-background hover:bg-muted/50"
                            )}
                        >
                            <p className="text-sm font-medium text-foreground">{fs.label}</p>
                            <p className="text-[10px] text-muted-foreground">{fs.size}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
                <div className="border-b border-border pb-2">
                    <h3 className="text-base font-semibold text-foreground">Sidebar</h3>
                    <p className="text-sm text-muted-foreground">Default sidebar behavior on page load.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                    <button
                        onClick={() => setSidebarBehavior("expanded")}
                        className={cn(
                            "flex items-center gap-3 rounded-lg border p-4 transition-all",
                            sidebarBehavior === "expanded"
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border bg-background hover:bg-muted/50"
                        )}
                    >
                        <PanelLeft className="h-5 w-5 text-muted-foreground" />
                        <div className="text-left">
                            <p className="text-sm font-semibold text-foreground">Expanded</p>
                            <p className="text-[10px] text-muted-foreground">Show labels</p>
                        </div>
                    </button>
                    <button
                        onClick={() => setSidebarBehavior("collapsed")}
                        className={cn(
                            "flex items-center gap-3 rounded-lg border p-4 transition-all",
                            sidebarBehavior === "collapsed"
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border bg-background hover:bg-muted/50"
                        )}
                    >
                        <PanelLeftClose className="h-5 w-5 text-muted-foreground" />
                        <div className="text-left">
                            <p className="text-sm font-semibold text-foreground">Collapsed</p>
                            <p className="text-[10px] text-muted-foreground">Icons only</p>
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