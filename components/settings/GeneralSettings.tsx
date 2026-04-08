"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Save, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const STORAGE_KEY = "lyra_admin_general";

const defaults = {
  dashboardName: "LyraAI Admin",
  autoRefresh: "30",
  language: "en",
};

const languages = [
  { value: "en", label: "English" },
  { value: "id", label: "Bahasa Indonesia" },
  { value: "ja", label: "日本語" },
  { value: "zh", label: "中文" },
];

export function GeneralSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(defaults);
  const [savedInterval, setSavedInterval] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaults, ...parsed });
        setSavedInterval(parseInt(parsed.autoRefresh ?? "30"));
      } catch {}
    } else {
      setSavedInterval(30);
    }
  }, []);

  const update = (key: keyof typeof defaults, value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const intervalVal = Math.max(5, Math.min(300, parseInt(settings.autoRefresh) || 30));

  const handleSave = () => {
    const toSave = { ...settings, autoRefresh: String(intervalVal) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    setSavedInterval(intervalVal);
    toast({
      title: "Settings Saved",
      description: `Auto-refresh set to every ${intervalVal}s. Takes effect on next page load.`,
    });
  };

  const handleReset = () => {
    setSettings(defaults);
    localStorage.removeItem(STORAGE_KEY);
    setSavedInterval(30);
    toast({ title: "Settings Reset", description: "General settings restored to defaults." });
  };

  return (
    <div className="flex-1 space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground">General</h2>
        <p className="text-sm text-muted-foreground">Configure dashboard preferences.</p>
      </div>

      {/* Dashboard Config */}
      <div className="space-y-4 border-t border-border pt-6">
        <div className="border-b border-border pb-2">
          <h3 className="text-base font-semibold text-foreground">Dashboard Configuration</h3>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Dashboard Name</label>
          <Input
            value={settings.dashboardName}
            onChange={(e) => update("dashboardName", e.target.value)}
            className="max-w-md"
            placeholder="Enter dashboard name"
          />
          <p className="text-xs text-muted-foreground">Appears in the sidebar header.</p>
        </div>

        {/* Auto Refresh */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
            Auto Refresh Interval
          </label>

          <div className="flex items-center gap-2 max-w-md">
            <Input
              type="number"
              value={settings.autoRefresh}
              onChange={(e) => update("autoRefresh", e.target.value)}
              className="w-24"
              min="5"
              max="300"
            />
            <span className="text-sm text-muted-foreground">seconds</span>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-2">
            {[10, 30, 60, 120].map((s) => (
              <button
                key={s}
                onClick={() => update("autoRefresh", String(s))}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                  intervalVal === s
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                {s >= 60 ? `${s / 60}m` : `${s}s`}
              </button>
            ))}
          </div>

          <div className="rounded-lg bg-muted/40 border border-border px-4 py-3 max-w-md">
            <p className="text-xs text-muted-foreground">
              Dashboard data will auto-refresh every{" "}
              <span className="font-semibold text-foreground">
                {intervalVal >= 60
                  ? `${Math.floor(intervalVal / 60)} minute${intervalVal >= 120 ? "s" : ""}`
                  : `${intervalVal} seconds`}
              </span>.
              {savedInterval && savedInterval !== intervalVal && (
                <span className="text-warning ml-1">
                  · Current: {savedInterval}s (save to apply)
                </span>
              )}
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            Min: 5s · Max: 300s · Only refreshes when tab is visible.
          </p>
        </div>
      </div>

      {/* Language */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2">
          <h3 className="text-base font-semibold text-foreground">Language</h3>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Interface Language
          </label>
          <div className="grid grid-cols-2 gap-2 max-w-md">
            {languages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => update("language", lang.value)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                  settings.language === lang.value
                    ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                    : "border-border bg-background text-foreground hover:bg-muted/50"
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button variant="outline" onClick={handleReset}>Reset to Default</Button>
        <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={handleSave}>
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </div>
    </div>
  );
}