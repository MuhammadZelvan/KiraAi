"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Save, AlertTriangle, Users, Zap, Power, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { getNotificationStats } from "@/lib/adminApi";

const STORAGE_KEY = "lyra_admin_notifications";

const defaults = {
  failed_login_alert: true,
  new_user_digest: true,
  kill_switch_alert: true,
  high_token_usage_alert: true,
};

interface Stats {
  failed_logins_24h: number;
  new_users_today: number;
  new_users_week: number;
  tokens_today: number;
  chat_kill_switch: string;
  maintenance_mode: string;
}

export function NotificationSettings() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState(defaults);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setPrefs({ ...defaults, ...JSON.parse(saved) }); } catch {}
    }

    getNotificationStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key: keyof typeof defaults) =>
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    toast({ title: "Notifications Saved", description: "Notification preferences updated." });
  };

  const handleReset = () => {
    setPrefs(defaults);
    localStorage.removeItem(STORAGE_KEY);
    toast({ title: "Notifications Reset" });
  };

  const formatTokens = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

  const notifItems = [
    {
      key: "failed_login_alert" as const,
      title: "Suspicious Login Activity",
      description: "Alert when 3+ failed login attempts detected from the same IP within 1 hour.",
      icon: AlertTriangle,
      iconColor: "text-destructive",
      iconBg: "bg-destructive/10",
      stat: stats ? `${stats.failed_logins_24h} failed logins in last 24h` : null,
      statAlert: stats ? stats.failed_logins_24h >= 5 : false,
    },
    {
      key: "new_user_digest" as const,
      title: "New User Digest",
      description: "Daily summary of new user registrations. Not per individual signup.",
      icon: Users,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      stat: stats ? `${stats.new_users_today} today · ${stats.new_users_week} this week` : null,
      statAlert: false,
    },
    {
      key: "kill_switch_alert" as const,
      title: "Kill Switch / Maintenance Alert",
      description: "Alert when chat kill switch or maintenance mode is activated.",
      icon: Power,
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
      stat: stats
        ? stats.chat_kill_switch === "on"
          ? "⚠️ Chat kill switch is currently ON"
          : stats.maintenance_mode === "on"
          ? "⚠️ Maintenance mode is currently ON"
          : "All systems operational"
        : null,
      statAlert: stats
        ? stats.chat_kill_switch === "on" || stats.maintenance_mode === "on"
        : false,
    },
    {
      key: "high_token_usage_alert" as const,
      title: "High Token Usage",
      description: "Alert when platform-wide token usage exceeds 80% of the daily aggregate threshold.",
      icon: Zap,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-500/10",
      stat: stats ? `${formatTokens(stats.tokens_today)} tokens used today` : null,
      statAlert: false,
    },
  ];

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Configure which system events trigger admin notifications.
          </p>
        </div>
        <Button
          variant="outline" size="sm" className="gap-2 text-xs"
          onClick={() => {
            setLoading(true);
            getNotificationStats().then(setStats).catch(console.error).finally(() => setLoading(false));
          }}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </Button>
      </div>

      {/* Live Stats Banner */}
      {!loading && stats && (stats.failed_logins_24h >= 5 || stats.chat_kill_switch === "on" || stats.maintenance_mode === "on") && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm font-semibold text-destructive">Attention Required</p>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
            {stats.failed_logins_24h >= 5 && (
              <li>{stats.failed_logins_24h} failed login attempts in the last 24 hours</li>
            )}
            {stats.chat_kill_switch === "on" && <li>Chat kill switch is currently active</li>}
            {stats.maintenance_mode === "on" && <li>Maintenance mode is currently active</li>}
          </ul>
        </div>
      )}

      {/* Notification Items */}
      <div className="space-y-3 border-t border-border pt-6">
        <div className="border-b border-border pb-2">
          <h3 className="text-base font-semibold text-foreground">Alert Preferences</h3>
          <p className="text-sm text-muted-foreground">Choose which events you want to be notified about.</p>
        </div>

        {notifItems.map((item) => (
          <div
            key={item.key}
            className={cn(
              "flex items-start justify-between gap-4 rounded-lg border p-4 transition-all",
              item.statAlert ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg mt-0.5", item.iconBg)}>
                <item.icon className={cn("h-5 w-5", item.iconColor)} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-md leading-relaxed">{item.description}</p>
                {item.stat && (
                  <p className={cn(
                    "text-[11px] mt-1.5 font-medium",
                    item.statAlert ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {loading ? "Loading..." : item.stat}
                  </p>
                )}
              </div>
            </div>
            <Switch checked={prefs[item.key]} onCheckedChange={() => toggle(item.key)} />
          </div>
        ))}
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