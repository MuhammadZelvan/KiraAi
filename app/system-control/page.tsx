"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Activity, Database, MessageSquare, Server, Wrench,
  Power, PowerOff, Loader2, RefreshCw, Cpu, Clock,
  CheckCircle2, XCircle, AlertTriangle, MemoryStick,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { getSystemFlags, setSystemFlag, getSystemHealth } from "@/lib/adminApi";

interface Flags {
  chat_kill_switch: string;
  maintenance_mode: string;
  daily_token_quota: string;
}

interface Health {
  status: string;
  db: { connected: boolean; latency_ms: number };
  uptime_seconds: number;
  memory_mb: number;
  node_version: string;
  timestamp: string;
}

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function SystemControlPage() {
  const { toast } = useToast();

  const [flags, setFlags] = useState<Flags | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [loadingFlags, setLoadingFlags] = useState(true);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [savingFlag, setSavingFlag] = useState<string | null>(null);
  const [quotaInput, setQuotaInput] = useState("");
  const [savingQuota, setSavingQuota] = useState(false);

  const fetchFlags = async () => {
    try {
      const data = await getSystemFlags();
      setFlags(data);
      setQuotaInput(data.daily_token_quota ?? "50000");
    } catch {
      toast({ title: "Failed to load system flags", variant: "destructive" });
    } finally {
      setLoadingFlags(false);
    }
  };

  const fetchHealth = async () => {
    setLoadingHealth(true);
    try {
      const data = await getSystemHealth();
      setHealth(data);
    } catch {
      toast({ title: "Failed to load system health", variant: "destructive" });
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchFlags();
    fetchHealth();
  }, []);

  const toggleFlag = async (key: keyof Flags) => {
    if (!flags) return;
    const current = flags[key];
    const newValue = current === "on" ? "off" : "on";

    setSavingFlag(key);
    try {
      await setSystemFlag(key, newValue);
      setFlags({ ...flags, [key]: newValue });
      toast({
        title: `${key === "chat_kill_switch" ? "Chat Kill Switch" : "Maintenance Mode"} ${newValue === "on" ? "enabled" : "disabled"}`,
      });
    } catch {
      toast({ title: "Failed to update flag", variant: "destructive" });
    } finally {
      setSavingFlag(null);
    }
  };

  const saveQuota = async () => {
    const val = parseInt(quotaInput);
    if (isNaN(val) || val < 1000) {
      toast({ title: "Minimum quota is 1,000 tokens", variant: "destructive" });
      return;
    }
    setSavingQuota(true);
    try {
      await setSystemFlag("daily_token_quota", String(val));
      setFlags((prev) => prev ? { ...prev, daily_token_quota: String(val) } : prev);
      toast({ title: "Daily quota updated", description: `Set to ${val.toLocaleString()} tokens/day` });
    } catch {
      toast({ title: "Failed to update quota", variant: "destructive" });
    } finally {
      setSavingQuota(false);
    }
  };

  const controls = [
    {
      key: "chat_kill_switch" as const,
      title: "Chat Kill Switch",
      description: "Instantly disable all chat functionality for all users. Use during emergencies or model issues.",
      icon: MessageSquare,
      dangerWhenOn: true,
    },
    {
      key: "maintenance_mode" as const,
      title: "Maintenance Mode",
      description: "Block user access to the platform with a maintenance notice. Admins can still access the dashboard.",
      icon: Wrench,
      dangerWhenOn: true,
    },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Control</h1>
          <p className="text-muted-foreground mt-1">
            Manage kill switches, maintenance mode, and monitor server health.
          </p>
        </div>

        {/* ===== SYSTEM HEALTH ===== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              System Health
            </h2>
            <Button
              variant="outline" size="sm" className="gap-2 text-xs"
              onClick={fetchHealth}
              disabled={loadingHealth}
            >
              {loadingHealth
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <RefreshCw className="h-3.5 w-3.5" />}
              Refresh
            </Button>
          </div>

          {loadingHealth ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : health ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {/* Overall status */}
              <div className="col-span-2 sm:col-span-4 flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                {health.status === "healthy"
                  ? <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                  : <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />}
                <div>
                  <p className="text-sm font-semibold text-foreground capitalize">{health.status}</p>
                  <p className="text-xs text-muted-foreground">
                    Last checked: {new Date(health.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {[
                {
                  label: "Database",
                  value: health.db.connected ? `Connected (${health.db.latency_ms}ms)` : "Disconnected",
                  icon: Database,
                  ok: health.db.connected,
                },
                {
                  label: "Uptime",
                  value: formatUptime(health.uptime_seconds),
                  icon: Clock,
                  ok: true,
                },
                {
                  label: "Memory",
                  value: `${health.memory_mb} MB`,
                  icon: Cpu,
                  ok: health.memory_mb < 512,
                },
                {
                  label: "Node",
                  value: health.node_version,
                  icon: Server,
                  ok: true,
                },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.ok
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                      : <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />}
                    <p className="text-sm font-semibold text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Unable to load health data.</p>
          )}
        </section>

        <div className="h-px bg-border" />

        {/* ===== KILL SWITCHES ===== */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Power className="h-4 w-4 text-primary" />
            Kill Switches
          </h2>

          {loadingFlags ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {controls.map((ctrl) => {
                const isOn = flags?.[ctrl.key] === "on";
                const isSaving = savingFlag === ctrl.key;

                return (
                  <div
                    key={ctrl.key}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-5 transition-all",
                      isOn && ctrl.dangerWhenOn
                        ? "border-destructive/40 bg-destructive/5"
                        : "border-border bg-card"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
                        isOn && ctrl.dangerWhenOn ? "bg-destructive/10" : "bg-muted"
                      )}>
                        <ctrl.icon className={cn(
                          "h-5 w-5",
                          isOn && ctrl.dangerWhenOn ? "text-destructive" : "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{ctrl.title}</p>
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            isOn
                              ? "bg-destructive/10 text-destructive"
                              : "bg-success/10 text-success"
                          )}>
                            {isOn ? "ON" : "OFF"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 max-w-lg">{ctrl.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleFlag(ctrl.key)}
                      disabled={isSaving}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50",
                        isOn ? "bg-destructive" : "bg-muted"
                      )}
                    >
                      {isSaving ? (
                        <span className="flex h-5 w-5 items-center justify-center">
                          <Loader2 className="h-3 w-3 animate-spin text-white" />
                        </span>
                      ) : (
                        <span className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          isOn ? "translate-x-5" : "translate-x-0"
                        )} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="h-px bg-border" />

        {/* ===== DAILY TOKEN QUOTA ===== */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            Daily Token Quota
          </h2>

          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground mb-4">
              Maximum tokens a regular user can consume per day. Admins are exempt from this limit.
              Current value: <span className="font-semibold text-foreground">
                {flags ? parseInt(flags.daily_token_quota).toLocaleString() : "—"}
              </span> tokens/day.
            </p>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={quotaInput}
                onChange={(e) => setQuotaInput(e.target.value)}
                className="w-48 bg-background"
                placeholder="e.g. 50000"
                min={1000}
              />
              <Button onClick={saveQuota} disabled={savingQuota || loadingFlags}>
                {savingQuota ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  "Save Quota"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Minimum: 1,000 tokens</p>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}