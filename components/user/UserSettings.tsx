"use client";

import { useState } from "react";
import { User, Bell, Upload, Trash2, LogOut, Key, Phone, Mail, Plus } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Section = "account" | "notification";

const menuItems = [
    { id: "account" as const, label: "My Account", icon: User },
    { id: "notification" as const, label: "Notification", icon: Bell },
];

/* ─── My Account ─── */
function AccountSection() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-0 divide-y divide-border">
            {/* Account */}
            <div className="p-6 md:p-8">
                <h2 className="text-base font-semibold text-foreground">Account</h2>
                <p className="text-sm text-muted-foreground mt-0.5 mb-5">Manage preferences and personal information</p>

                {/* Avatar row */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative h-14 w-14 shrink-0">
                        <div className="h-14 w-14 rounded-full bg-muted overflow-hidden flex items-center justify-center border border-border">
                            <Image src="/logo.png" alt="avatar" width={56} height={56} className="object-cover" />
                        </div>
                    </div>
                    <div>
                        <p className="font-semibold text-foreground text-sm">Mas Prabowo</p>
                        <p className="text-xs text-muted-foreground">Product Manager</p>
                    </div>
                    <div className="ml-auto flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                            <Upload className="h-3.5 w-3.5" /> Upload new picture
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs text-destructive hover:text-destructive border-destructive/20 hover:border-destructive/40">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                    </div>
                </div>

                {/* Name inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">First name</label>
                        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Enter first name" className="h-9" />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Last name</label>
                        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Enter last name" className="h-9" />
                    </div>
                </div>
            </div>

            {/* Contact */}
            <div className="p-6 md:p-8">
                <h2 className="text-base font-semibold text-foreground">Contact</h2>
                <p className="text-sm text-muted-foreground mt-0.5 mb-5">Trusted by +50,000 professionals world wide.</p>

                {/* Email row */}
                <div className="mb-4">
                    <label className="text-xs text-muted-foreground mb-2 block">Email</label>
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-foreground">prabowo@gmail.com</span>
                        </div>
                        <Button size="sm" className="gap-1.5 h-9 shrink-0">
                            <Plus className="h-3.5 w-3.5" /> Add New
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 shrink-0 text-destructive border-destructive/20 hover:border-destructive/40">
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Phone row */}
                <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Phone Number</label>
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-foreground">+1.434.353.4.3531</span>
                        </div>
                        <Button size="sm" className="gap-1.5 h-9 shrink-0">
                            <Plus className="h-3.5 w-3.5" /> Add New
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 shrink-0 text-destructive border-destructive/20 hover:border-destructive/40">
                            Delete
                        </Button>
                    </div>
                </div>
            </div>

            {/* Account Security */}
            <div className="p-6 md:p-8">
                <h2 className="text-base font-semibold text-foreground">Account Security</h2>
                <p className="text-sm text-muted-foreground mt-0.5 mb-5">Manage your account security.</p>

                <div>
                    <label className="text-xs text-muted-foreground mb-2 block">My Password</label>
                    <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 h-9">
                        <div className="flex items-center gap-2">
                            <Key className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-foreground tracking-widest">••••••••••</span>
                        </div>
                        <button className="text-xs text-primary hover:underline underline-offset-2 font-medium">Change password</button>
                    </div>
                </div>
            </div>

            {/* Logout */}
            <div className="p-6 md:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-foreground">Log Out My Account</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">Manage your account security.</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5">
                        <LogOut className="h-3.5 w-3.5" /> Log Out
                    </Button>
                </div>
            </div>

            {/* Delete */}
            <div className="p-6 md:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-foreground">Delete My Account</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">Manage your account security.</p>
                    </div>
                    <Button variant="destructive" size="sm" className="gap-1.5">
                        <Trash2 className="h-3.5 w-3.5" /> Delete my Account
                    </Button>
                </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-end gap-3 px-6 md:px-8 py-4 bg-card/50">
                <Button variant="outline" size="sm">Cancel</Button>
                <Button size="sm" className="px-6" onClick={handleSave}>
                    {saved ? "✓ Saved!" : "Save Changes"}
                </Button>
            </div>
        </div>
    );
}

/* ─── Notification ─── */
interface NotifItem {
    label: string;
    desc: string;
    defaultOn: boolean;
}

function NotifGroup({ title, subtitle, items }: { title: string; subtitle: string; items: NotifItem[] }) {
    const [states, setStates] = useState<boolean[]>(items.map((i) => i.defaultOn));
    return (
        <div className="p-6 md:p-8 space-y-4">
            <div>
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            </div>
            <div className="space-y-4">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{item.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                        </div>
                        <Switch
                            checked={states[idx]}
                            onCheckedChange={(v) => setStates((prev) => prev.map((s, i) => (i === idx ? v : s)))}
                            className="shrink-0 mt-0.5"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

function NotificationSection() {
    return (
        <div className="divide-y divide-border">
            <NotifGroup
                title="Email Notifications"
                subtitle="Stay updated via inbox alerts for messages and activities."
                items={[
                    { label: "New Message", desc: "Get instant notifications by email whenever you receive new messages, mentions, or replies from your team.", defaultOn: false },
                    { label: "Reminders & Schedules", desc: "Receive timely alerts for upcoming tasks, meetings, or important events so you can stay organized and never miss a deadline.", defaultOn: true },
                    { label: "Security Alert", desc: "Be alerted immediately when there's a login attempt from a new device or unusual location to help keep your account secure.", defaultOn: true },
                ]}
            />
            <NotifGroup
                title="System Notifications"
                subtitle="Monitor system health, errors, and service updates."
                items={[
                    { label: "Maintenance Update", desc: "Stay informed about planned maintenance, server updates, or brief system downtimes so you can plan accordingly.", defaultOn: true },
                    { label: "System Errors", desc: "Receive alerts if system errors or failures affect your dashboard performance, ensuring you're always in the loop.", defaultOn: false },
                ]}
            />
            <NotifGroup
                title="Productivity Notifications"
                subtitle="Boost focus with timely task and distraction alerts."
                items={[
                    { label: "Distraction Alert", desc: "Detects when you're inactive or off-task, and gently reminds you to refocus and stay productive.", defaultOn: false },
                    { label: "Do Not Disturb Mode", desc: "Automatically activate quiet hours during focus sessions or meetings. Notifications are silenced so you can work without interruption.", defaultOn: true },
                ]}
            />
        </div>
    );
}

/* ─── Main Export ─── */
export function UserSettings() {
    const [active, setActive] = useState<Section>("account");

    return (
        <div className="flex h-full flex-col md:flex-row overflow-hidden">
            {/* Left nav */}
            <div className="shrink-0 border-b md:border-b-0 md:border-r border-border bg-card w-full md:w-56">
                <div className="p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Settings Menu</p>
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActive(item.id)}
                            className={cn(
                                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-0.5",
                                active === item.id
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4 shrink-0" />
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Right content */}
            <div className="flex-1 overflow-y-auto">
                {active === "account" ? <AccountSection /> : <NotificationSection />}
            </div>
        </div>
    );
}
