"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Shield, Key, Globe, Clock, Monitor, MapPin,
  LogOut, Save, AlertTriangle, CheckCircle2, Loader2, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { getAdminLoginHistory, getSuspiciousActivity, adminLogout } from "@/lib/adminApi";

interface LoginEntry {
  id: string;
  email: string;
  method: string;
  success: boolean;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface SuspiciousEntry {
  ip_address: string;
  attempts: number;
  last_attempt: string;
}

function parseDevice(userAgent: string) {
  if (!userAgent || userAgent === "—") return "Unknown Device";
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari")) return "Safari";
  if (userAgent.includes("Mobile")) return "Mobile Browser";
  return userAgent.slice(0, 40);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function SecuritySettings() {
  const { toast } = useToast();
  const router = useRouter();

  const [loginHistory, setLoginHistory] = useState<LoginEntry[]>([]);
  const [suspicious, setSuspicious] = useState<SuspiciousEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [tokenRegenConfirm, setTokenRegenConfirm] = useState(false);

  // UI-only settings
  const [twoFactor, setTwoFactor] = useState(false);
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  const fetchData = async () => {
    setLoadingHistory(true);
    try {
      const [history, susp] = await Promise.all([
        getAdminLoginHistory(),
        getSuspiciousActivity(),
      ]);
      setLoginHistory(history);
      setSuspicious(susp);
    } catch {
      toast({ title: "Failed to load security data", variant: "destructive" });
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await adminLogout();
      router.push("/login");
    } catch {
      toast({ title: "Logout failed", variant: "destructive" });
      setLoggingOut(false);
    }
  };

  const handleRegenerateToken = () => {
    if (!tokenRegenConfirm) {
      setTokenRegenConfirm(true);
      toast({
        title: "Confirm Token Regeneration",
        description: "Click again to confirm. This will log you out.",
      });
      setTimeout(() => setTokenRegenConfirm(false), 5000);
      return;
    }
    // Regenerate = force logout (JWT is stateless, clearing cookie = new session on next login)
    toast({ title: "Session invalidated", description: "Redirecting to login..." });
    setTokenRegenConfirm(false);
    setTimeout(() => handleLogout(), 1000);
  };

  return (
    <div className="flex-1 space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Security</h2>
        <p className="text-sm text-muted-foreground">Manage authentication, sessions, and access controls.</p>
      </div>

      {/* Suspicious Activity Banner */}
      {suspicious.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm font-semibold text-destructive">Suspicious Activity Detected</p>
          </div>
          <div className="space-y-1">
            {suspicious.map((s: any) => (
              <p key={s.ip_address} className="text-xs text-muted-foreground ml-6">
                {s.attempts} failed attempts from <code className="font-mono">{s.ip_address}</code> in the last hour
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Authentication */}
      <div className="space-y-4 border-t border-border pt-6">
        <div className="border-b border-border pb-2">
          <h3 className="text-base font-semibold text-foreground">Authentication</h3>
        </div>

        {/* Token */}
        <div className="rounded-lg border border-border p-4 bg-muted/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Session Token</p>
              <p className="text-xs text-muted-foreground">Your admin session is managed via a secure JWT cookie.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-muted-foreground">
              access_token: ••••••••••••••••
            </div>
            <Button
              variant={tokenRegenConfirm ? "destructive" : "outline"}
              size="sm"
              onClick={handleRegenerateToken}
            >
              {tokenRegenConfirm ? "⚠️ Confirm" : "Invalidate Session"}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Invalidating will clear your session cookie. You will need to log in again.
          </p>
        </div>

        {/* 2FA — UI only */}
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Shield className="h-5 w-5 text-success" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">Coming soon</span>
              </div>
              <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
            </div>
          </div>
          <Switch checked={twoFactor} onCheckedChange={setTwoFactor} disabled />
        </div>

        {/* Login Alerts — UI only */}
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Login Alerts</p>
              <p className="text-xs text-muted-foreground">Get notified when someone logs in from a new device.</p>
            </div>
          </div>
          <Switch checked={loginAlerts} onCheckedChange={setLoginAlerts} />
        </div>

        {/* IP Whitelist — UI only */}
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Globe className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">IP Whitelist</p>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">Coming soon</span>
              </div>
              <p className="text-xs text-muted-foreground">Restrict dashboard access to specific IP addresses.</p>
            </div>
          </div>
          <Switch checked={ipWhitelist} onCheckedChange={setIpWhitelist} disabled />
        </div>
      </div>

      {/* Login History — Real data */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Login History</h3>
            <p className="text-sm text-muted-foreground">Recent admin login attempts.</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={fetchData} disabled={loadingHistory}>
            {loadingHistory ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </Button>
        </div>

        {loadingHistory ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : loginHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No login history found.</p>
        ) : (
          <div className="space-y-2">
            {loginHistory.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  {entry.success
                    ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    : <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
                  <div>
                    <p className="text-sm font-medium text-foreground">{entry.email}</p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                      <span>{parseDevice(entry.user_agent)}</span>
                      <span>•</span>
                      <span className="font-mono">{entry.ip_address}</span>
                      <span>•</span>
                      <span className="capitalize">{entry.method}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">{timeAgo(entry.created_at)}</p>
                  <span className={cn(
                    "text-[10px] font-semibold",
                    entry.success ? "text-success" : "text-destructive"
                  )}>
                    {entry.success ? "Success" : "Failed"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Log Out</p>
          <p className="text-xs text-muted-foreground">Sign out of this admin session.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          Log Out
        </Button>
      </div>
    </div>
  );
}