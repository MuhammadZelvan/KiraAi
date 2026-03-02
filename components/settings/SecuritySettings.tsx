"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Shield,
    Key,
    Globe,
    Clock,
    Monitor,
    MapPin,
    LogOut,
    Save,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export function SecuritySettings() {
    const { toast } = useToast();

    const [sessionTimeout, setSessionTimeout] = useState("60");
    const [twoFactor, setTwoFactor] = useState(false);
    const [ipWhitelist, setIpWhitelist] = useState(true);
    const [whitelistIPs, setWhitelistIPs] = useState("192.168.1.0/24");
    const [loginAlerts, setLoginAlerts] = useState(true);

    const loginHistory = [
        { id: "1", device: "Windows 11 — Chrome", ip: "192.168.1.101", location: "Jakarta, ID", time: "Today, 08:24 AM", status: "success" as const },
        { id: "2", device: "Windows 11 — Chrome", ip: "192.168.1.101", location: "Jakarta, ID", time: "Yesterday, 09:12 AM", status: "success" as const },
        { id: "3", device: "macOS — Safari", ip: "103.45.67.89", location: "Surabaya, ID", time: "Feb 22, 2:45 PM", status: "success" as const },
        { id: "4", device: "Linux — Firefox", ip: "185.22.33.44", location: "Unknown", time: "Feb 21, 11:30 PM", status: "failed" as const },
        { id: "5", device: "Windows 11 — Chrome", ip: "192.168.1.101", location: "Jakarta, ID", time: "Feb 20, 08:00 AM", status: "success" as const },
    ];

    const activeSessions = [
        { id: "1", device: "Windows 11 — Chrome", ip: "192.168.1.101", location: "Jakarta, ID", lastActive: "Now", current: true },
        { id: "2", device: "Mobile — KiraAI App", ip: "192.168.1.105", location: "Jakarta, ID", lastActive: "2 hours ago", current: false },
    ];

    const handleSave = () => {
        toast({
            title: "Security Updated",
            description: "Security settings have been saved successfully.",
        });
    };

    const handleReset = () => {
        setSessionTimeout("60");
        setTwoFactor(false);
        setIpWhitelist(true);
        setWhitelistIPs("192.168.1.0/24");
        setLoginAlerts(true);
        toast({
            title: "Security Reset",
            description: "Security settings restored to defaults.",
        });
    };

    const [tokenRegenConfirm, setTokenRegenConfirm] = useState(false);
    const router = useRouter();

    const handleRegenerateToken = () => {
        if (!tokenRegenConfirm) {
            setTokenRegenConfirm(true);
            toast({
                title: "Confirm Token Regeneration",
                description: "Click 'Regenerate Token' again to confirm. This will log you out.",
            });
            setTimeout(() => setTokenRegenConfirm(false), 5000);
            return;
        }
        toast({
            title: "Token Regenerated",
            description: "New token generated. Redirecting to login...",
        });
        setTokenRegenConfirm(false);
        setTimeout(() => router.push("/login"), 1500);
    };

    const handleLogout = () => {
        toast({
            title: "Logged Out",
            description: "Your session has been terminated.",
        });
        setTimeout(() => router.push("/login"), 500);
    };

    const handleRevokeSession = (id: string) => {
        toast({
            title: "Session Revoked",
            description: `Session ${id} has been terminated.`,
        });
    };

    const handleRevokeAll = () => {
        toast({
            title: "All Sessions Revoked",
            description: "All other sessions have been terminated.",
        });
    };

    return (
        <div className="flex-1 space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-foreground">Security</h2>
                <p className="text-sm text-muted-foreground">
                    Manage authentication, sessions, and access controls.
                </p>
            </div>

            {/* Authentication */}
            <div className="space-y-4 border-t border-border pt-6">
                <div className="border-b border-border pb-2">
                    <h3 className="text-base font-semibold text-foreground">Authentication</h3>
                    <p className="text-sm text-muted-foreground">Manage your authentication token and 2FA.</p>
                </div>

                {/* Token Auth Info */}
                <div className="rounded-lg border border-border p-4 bg-muted/20">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Key className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Token Authentication</p>
                            <p className="text-xs text-muted-foreground">Your admin access is managed via a secure token.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                        <Input
                            type="password"
                            value="kira_admin_tk_••••••••••••"
                            disabled
                            className="flex-1 font-mono text-xs bg-background"
                        />
                        <Button
                            variant={tokenRegenConfirm ? "destructive" : "outline"}
                            size="sm"
                            onClick={handleRegenerateToken}
                        >
                            {tokenRegenConfirm ? "⚠️ Confirm Regenerate" : "Regenerate Token"}
                        </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                        ⚠️ Regenerating will invalidate the current token. You will need to re-login.
                    </p>
                </div>

                {/* 2FA */}
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                            <Shield className="h-5 w-5 text-success" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                            <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
                        </div>
                    </div>
                    <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                </div>

                {/* Login Alerts */}
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
            </div>

            {/* Session Management */}
            <div className="space-y-4">
                <div className="border-b border-border pb-2">
                    <h3 className="text-base font-semibold text-foreground">Session Management</h3>
                    <p className="text-sm text-muted-foreground">Control session timeout and active sessions.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Session Timeout
                    </label>
                    <div className="flex items-center gap-2 max-w-sm">
                        <Input
                            type="number"
                            value={sessionTimeout}
                            onChange={(e) => setSessionTimeout(e.target.value)}
                            className="w-24"
                            min="5"
                            max="480"
                        />
                        <span className="text-sm text-muted-foreground">minutes of inactivity</span>
                    </div>
                </div>

                {/* IP Whitelist */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            IP Whitelist
                        </label>
                        <Switch checked={ipWhitelist} onCheckedChange={setIpWhitelist} />
                    </div>
                    {ipWhitelist && (
                        <div className="space-y-2">
                            <Input
                                value={whitelistIPs}
                                onChange={(e) => setWhitelistIPs(e.target.value)}
                                placeholder="e.g. 192.168.1.0/24, 10.0.0.1"
                                className="max-w-md font-mono text-xs"
                            />
                            <p className="text-[10px] text-muted-foreground">Comma-separated IPs or CIDR ranges. Only these IPs can access the dashboard.</p>
                        </div>
                    )}
                </div>

                {/* Active Sessions */}
                <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">Active Sessions</p>
                        <Button variant="outline" size="sm" className="text-xs text-destructive hover:text-destructive" onClick={handleRevokeAll}>
                            Revoke All Others
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {activeSessions.map((session) => (
                            <div key={session.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                                <div className="flex items-center gap-3">
                                    <Monitor className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-foreground">{session.device}</p>
                                            {session.current && (
                                                <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                            <span>{session.ip}</span>
                                            <span>•</span>
                                            <span>{session.location}</span>
                                            <span>•</span>
                                            <span>{session.lastActive}</span>
                                        </div>
                                    </div>
                                </div>
                                {!session.current && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs text-destructive hover:text-destructive"
                                        onClick={() => handleRevokeSession(session.id)}
                                    >
                                        Revoke
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Login History */}
            <div className="space-y-4">
                <div className="border-b border-border pb-2">
                    <h3 className="text-base font-semibold text-foreground">Login History</h3>
                    <p className="text-sm text-muted-foreground">Recent login attempts to your admin account.</p>
                </div>

                <div className="space-y-2">
                    {loginHistory.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/20">
                            <div className="flex items-center gap-3">
                                {entry.status === "success" ? (
                                    <CheckCircle2 className="h-4 w-4 text-success" />
                                ) : (
                                    <AlertTriangle className="h-4 w-4 text-destructive" />
                                )}
                                <div>
                                    <p className="text-sm font-medium text-foreground">{entry.device}</p>
                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                        <span>{entry.ip}</span>
                                        <span>•</span>
                                        <MapPin className="h-3 w-3" />
                                        <span>{entry.location}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">{entry.time}</p>
                                <span className={cn(
                                    "text-[10px] font-semibold",
                                    entry.status === "success" ? "text-success" : "text-destructive"
                                )}>
                                    {entry.status === "success" ? "Success" : "Failed"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Logout */}
            <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                    <h3 className="font-medium text-foreground">Log Out</h3>
                    <p className="text-sm text-muted-foreground">Sign out of this admin session.</p>
                </div>
                <Button variant="outline" className="gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Log Out
                </Button>
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
