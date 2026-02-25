"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Sun,
    Moon,
    Monitor,
    PanelLeftClose,
    PanelLeft,
    Save,
    Palette,
    Type,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export function AppearanceSettings() {
    const { toast } = useToast();

    const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");
    const [sidebarBehavior, setSidebarBehavior] = useState<"expanded" | "collapsed">("expanded");
    const [accentColor, setAccentColor] = useState("violet");
    const [animations, setAnimations] = useState(true);
    const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");

    const themes = [
        { value: "light" as const, label: "Light", icon: Sun, description: "Light background with dark text" },
        { value: "dark" as const, label: "Dark", icon: Moon, description: "Dark background, easier on eyes" },
        { value: "system" as const, label: "System", icon: Monitor, description: "Follows OS preference" },
    ];

    const accentColors = [
        { value: "violet", label: "Violet", class: "bg-violet-500" },
        { value: "blue", label: "Blue", class: "bg-blue-500" },
        { value: "green", label: "Green", class: "bg-green-500" },
        { value: "orange", label: "Orange", class: "bg-orange-500" },
        { value: "rose", label: "Rose", class: "bg-rose-500" },
        { value: "cyan", label: "Cyan", class: "bg-cyan-500" },
    ];

    const fontSizes = [
        { value: "small" as const, label: "Small", size: "13px" },
        { value: "medium" as const, label: "Medium", size: "14px" },
        { value: "large" as const, label: "Large", size: "16px" },
    ];

    const handleSave = () => {
        toast({
            title: "Appearance Updated",
            description: "Your appearance settings have been saved.",
        });
    };

    const handleReset = () => {
        setTheme("dark");
        setSidebarBehavior("expanded");
        setAccentColor("violet");
        setAnimations(true);
        setFontSize("medium");
        toast({
            title: "Appearance Reset",
            description: "Appearance settings restored to defaults.",
        });
    };

    return (
        <div className="flex-1 space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
                <p className="text-sm text-muted-foreground">
                    Customize the look and feel of the dashboard.
                </p>
            </div>

            {/* Theme Selection */}
            <div className="space-y-4 border-t border-border pt-6">
                <div className="border-b border-border pb-2">
                    <h3 className="text-base font-semibold text-foreground">Theme Mode</h3>
                    <p className="text-sm text-muted-foreground">Choose your preferred color scheme.</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {themes.map((t) => (
                        <button
                            key={t.value}
                            onClick={() => setTheme(t.value)}
                            className={cn(
                                "flex flex-col items-center gap-3 rounded-lg border p-4 transition-all",
                                theme === t.value
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "border-border bg-background hover:bg-muted/50"
                            )}
                        >
                            <div className={cn(
                                "flex h-12 w-12 items-center justify-center rounded-lg",
                                theme === t.value ? "bg-primary/10" : "bg-muted"
                            )}>
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

            {/* Accent Color */}
            <div className="space-y-4">
                <div className="border-b border-border pb-2">
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Accent Color
                    </h3>
                    <p className="text-sm text-muted-foreground">Primary accent used for buttons, links, and highlights.</p>
                </div>

                <div className="flex items-center gap-3">
                    {accentColors.map((color) => (
                        <button
                            key={color.value}
                            onClick={() => setAccentColor(color.value)}
                            className={cn(
                                "relative flex h-10 w-10 items-center justify-center rounded-full transition-all",
                                color.class,
                                accentColor === color.value
                                    ? "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110"
                                    : "opacity-60 hover:opacity-100 hover:scale-105"
                            )}
                            title={color.label}
                        >
                            {accentColor === color.value && (
                                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground">
                    Current: <span className="font-medium text-foreground capitalize">{accentColor}</span>
                </p>
            </div>

            {/* Font Size */}
            <div className="space-y-4">
                <div className="border-b border-border pb-2">
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Font Size
                    </h3>
                    <p className="text-sm text-muted-foreground">Adjust the base font size of the interface.</p>
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

            {/* Animations */}
            <div className="space-y-4">
                <div className="border-b border-border pb-2">
                    <h3 className="text-base font-semibold text-foreground">Motion & Animations</h3>
                    <p className="text-sm text-muted-foreground">Control UI transition effects.</p>
                </div>

                <div className="flex items-center justify-between max-w-md rounded-lg border border-border p-4">
                    <div>
                        <p className="text-sm font-medium text-foreground">Enable Animations</p>
                        <p className="text-xs text-muted-foreground">Smooth transitions and micro-interactions</p>
                    </div>
                    <Switch checked={animations} onCheckedChange={setAnimations} />
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
