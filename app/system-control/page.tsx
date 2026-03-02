"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Plus,
    Filter,
    ArrowUpDown,
    MoreHorizontal,
    Bot,
    Globe,
    MessageSquare,
    Shield,
    Zap,
    Database,
    Bell,
    Cloud,
    Lock,
    RefreshCw,
    Settings2,
    Activity,
    Power,
    PowerOff,
    RotateCcw,
    Trash2,
    Eye,
    Cpu,
    Brain,
    Sparkles,
    Workflow,
    ShieldCheck,
    ShieldAlert,
    KeyRound,
    Fingerprint,
    Clock,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Info,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DatePickerDemo } from "@/components/apikeys/DatePicker";
import { useToast } from "@/components/ui/use-toast";

type TabType = "integrations" | "ai-models" | "security" | "logs";
type FilterType = "all" | "active" | "inactive";
type SortType = "name-asc" | "name-desc" | "status" | "category";

interface Integration {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    enabled: boolean;
    status: "active" | "inactive" | "error";
    category: string;
}

interface AIModel {
    id: string;
    name: string;
    provider: string;
    version: string;
    status: "active" | "inactive" | "fine-tuning";
    type: string;
    maxTokens: number;
    icon: React.ElementType;
}

interface SecuritySetting {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    icon: React.ElementType;
    severity: "high" | "medium" | "low";
}

interface LogEntry {
    id: string;
    timestamp: string;
    level: "info" | "warning" | "error" | "success";
    message: string;
    source: string;
}

const initialIntegrations: Integration[] = [
    {
        id: "1",
        name: "OpenAI GPT-4",
        description: "Primary language model for chatbot responses and text generation.",
        icon: Bot,
        enabled: true,
        status: "active",
        category: "AI Model",
    },
    {
        id: "2",
        name: "Web Search API",
        description: "Real-time web search integration for up-to-date information retrieval.",
        icon: Globe,
        enabled: true,
        status: "active",
        category: "Search",
    },
    {
        id: "3",
        name: "WhatsApp Business",
        description: "Connect chatbot with WhatsApp Business API for messaging.",
        icon: MessageSquare,
        enabled: false,
        status: "inactive",
        category: "Messaging",
    },
    {
        id: "4",
        name: "Rate Limiter",
        description: "Control API request rates to prevent abuse and manage costs.",
        icon: Shield,
        enabled: true,
        status: "active",
        category: "Security",
    },
    {
        id: "5",
        name: "Auto-Scaling Engine",
        description: "Automatically scale resources based on traffic and demand.",
        icon: Zap,
        enabled: true,
        status: "active",
        category: "Performance",
    },
    {
        id: "6",
        name: "Vector Database",
        description: "Store and retrieve embeddings for semantic search and RAG.",
        icon: Database,
        enabled: true,
        status: "active",
        category: "Storage",
    },
    {
        id: "7",
        name: "Alert Notifications",
        description: "System alerts and notifications for critical events and errors.",
        icon: Bell,
        enabled: false,
        status: "inactive",
        category: "Monitoring",
    },
    {
        id: "8",
        name: "Cloud Backup",
        description: "Automated cloud backup for conversation data and configurations.",
        icon: Cloud,
        enabled: true,
        status: "active",
        category: "Storage",
    },
    {
        id: "9",
        name: "SSL/TLS Encryption",
        description: "End-to-end encryption for all API communications and data transfer.",
        icon: Lock,
        enabled: true,
        status: "active",
        category: "Security",
    },
];

const iconOptions = [
    { value: "Bot", label: "Bot", icon: Bot },
    { value: "Globe", label: "Globe", icon: Globe },
    { value: "MessageSquare", label: "Message", icon: MessageSquare },
    { value: "Shield", label: "Shield", icon: Shield },
    { value: "Zap", label: "Zap", icon: Zap },
    { value: "Database", label: "Database", icon: Database },
    { value: "Bell", label: "Bell", icon: Bell },
    { value: "Cloud", label: "Cloud", icon: Cloud },
    { value: "Lock", label: "Lock", icon: Lock },
    { value: "Cpu", label: "CPU", icon: Cpu },
    { value: "Brain", label: "Brain", icon: Brain },
    { value: "Sparkles", label: "Sparkles", icon: Sparkles },
    { value: "Workflow", label: "Workflow", icon: Workflow },
];

const categoryOptions = [
    "AI Model", "Search", "Messaging", "Security", "Performance", "Storage", "Monitoring", "Analytics", "Other"
];

export default function SystemControlPage() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<TabType>("integrations");
    const [filter, setFilter] = useState<FilterType>("all");
    const [sortBy, setSortBy] = useState<SortType>("name-asc");
    const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [configDialogOpen, setConfigDialogOpen] = useState(false);
    const [configIntegration, setConfigIntegration] = useState<Integration | null>(null);

    // Add Integration Form
    const [newIntegration, setNewIntegration] = useState({
        name: "",
        description: "",
        category: "Other",
        iconKey: "Bot",
    });

    // AI Models state
    const [aiModels] = useState<AIModel[]>([
        { id: "m1", name: "GPT-4 Turbo", provider: "OpenAI", version: "4.0-turbo", status: "active", type: "Language", maxTokens: 128000, icon: Bot },
        { id: "m2", name: "GPT-3.5 Turbo", provider: "OpenAI", version: "3.5-turbo", status: "active", type: "Language", maxTokens: 16384, icon: Brain },
        { id: "m3", name: "Claude 3 Opus", provider: "Anthropic", version: "3.0-opus", status: "inactive", type: "Language", maxTokens: 200000, icon: Sparkles },
        { id: "m4", name: "Gemini Pro", provider: "Google", version: "1.0-pro", status: "active", type: "Multimodal", maxTokens: 32768, icon: Cpu },
        { id: "m5", name: "Whisper Large", provider: "OpenAI", version: "large-v3", status: "fine-tuning", type: "Speech", maxTokens: 0, icon: Activity },
        { id: "m6", name: "DALL-E 3", provider: "OpenAI", version: "3.0", status: "active", type: "Image", maxTokens: 0, icon: Workflow },
    ]);

    // Security settings state
    const [securitySettings, setSecuritySettings] = useState<SecuritySetting[]>([
        { id: "s1", name: "Two-Factor Authentication", description: "Require 2FA for all admin accounts accessing the dashboard.", enabled: true, icon: Fingerprint, severity: "high" },
        { id: "s2", name: "API Rate Limiting", description: "Limit API requests to 1000 req/min per user to prevent abuse.", enabled: true, icon: ShieldCheck, severity: "high" },
        { id: "s3", name: "IP Whitelisting", description: "Restrict API access to whitelisted IP addresses only.", enabled: false, icon: ShieldAlert, severity: "medium" },
        { id: "s4", name: "SSL/TLS Encryption", description: "Enforce HTTPS connections for all API communications.", enabled: true, icon: Lock, severity: "high" },
        { id: "s5", name: "API Key Rotation", description: "Automatically rotate API keys every 90 days for security.", enabled: false, icon: KeyRound, severity: "medium" },
        { id: "s6", name: "Session Timeout", description: "Automatically log out inactive users after 30 minutes.", enabled: true, icon: Clock, severity: "low" },
    ]);

    // System logs state
    const [logs, setLogs] = useState<LogEntry[]>([
        { id: "l1", timestamp: "2026-02-23 07:10:00", level: "success", message: "GPT-4 Turbo model initialized successfully", source: "AI Engine" },
        { id: "l2", timestamp: "2026-02-23 07:08:45", level: "info", message: "Cloud backup completed — 1.2GB synced", source: "Backup Service" },
        { id: "l3", timestamp: "2026-02-23 07:05:32", level: "warning", message: "API rate limit approaching threshold (850/1000 req/min)", source: "Rate Limiter" },
        { id: "l4", timestamp: "2026-02-23 07:02:18", level: "error", message: "WhatsApp Business API connection timeout", source: "Messaging" },
        { id: "l5", timestamp: "2026-02-23 06:58:00", level: "info", message: "Auto-scaling triggered — 2 new instances launched", source: "Scaling Engine" },
        { id: "l6", timestamp: "2026-02-23 06:55:12", level: "success", message: "SSL certificate renewed for api.kiraai.com", source: "Security" },
        { id: "l7", timestamp: "2026-02-23 06:50:00", level: "info", message: "Vector database index rebuilt — 50k embeddings updated", source: "Vector DB" },
        { id: "l8", timestamp: "2026-02-23 06:45:30", level: "warning", message: "Memory usage at 78% — consider scaling resources", source: "Monitoring" },
        { id: "l9", timestamp: "2026-02-23 06:40:00", level: "success", message: "User authentication service started", source: "Auth Service" },
        { id: "l10", timestamp: "2026-02-23 06:35:15", level: "error", message: "Failed to connect to analytics endpoint", source: "Analytics" },
    ]);

    // ===== INTEGRATIONS FUNCTIONS =====
    const toggleIntegration = (id: string) => {
        setIntegrations((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        enabled: !item.enabled,
                        status: !item.enabled ? "active" : "inactive",
                    }
                    : item
            )
        );
    };

    const getFilteredAndSortedIntegrations = () => {
        let filtered = [...integrations];

        // Filter
        if (filter === "active") {
            filtered = filtered.filter((i) => i.enabled);
        } else if (filter === "inactive") {
            filtered = filtered.filter((i) => !i.enabled);
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "name-asc":
                    return a.name.localeCompare(b.name);
                case "name-desc":
                    return b.name.localeCompare(a.name);
                case "status":
                    return a.status.localeCompare(b.status);
                case "category":
                    return a.category.localeCompare(b.category);
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const handleEnableAll = () => {
        setIntegrations((prev) =>
            prev.map((item) => ({ ...item, enabled: true, status: "active" as const }))
        );
        toast({ title: "All Enabled", description: "All integrations have been enabled." });
    };

    const handleDisableAll = () => {
        setIntegrations((prev) =>
            prev.map((item) => ({ ...item, enabled: false, status: "inactive" as const }))
        );
        toast({ title: "All Disabled", description: "All integrations have been disabled." });
    };

    const handleResetAll = () => {
        setIntegrations(initialIntegrations);
        toast({ title: "Reset Complete", description: "All integrations have been reset to default." });
    };

    const handleAddIntegration = () => {
        if (!newIntegration.name) {
            toast({ title: "Validation Error", description: "Please enter a name for the integration.", variant: "destructive" });
            return;
        }
        if (!newIntegration.description) {
            toast({ title: "Validation Error", description: "Please enter a description.", variant: "destructive" });
            return;
        }

        const selectedIcon = iconOptions.find((i) => i.value === newIntegration.iconKey)?.icon || Bot;

        const newItem: Integration = {
            id: Date.now().toString(),
            name: newIntegration.name,
            description: newIntegration.description,
            icon: selectedIcon,
            enabled: true,
            status: "active",
            category: newIntegration.category,
        };

        setIntegrations((prev) => [...prev, newItem]);
        toast({ title: "Integration Added", description: `"${newIntegration.name}" has been added successfully.` });
        setNewIntegration({ name: "", description: "", category: "Other", iconKey: "Bot" });
        setAddDialogOpen(false);
    };

    const handleDeleteIntegration = (id: string) => {
        const item = integrations.find((i) => i.id === id);
        setIntegrations((prev) => prev.filter((i) => i.id !== id));
        toast({ title: "Integration Removed", description: `"${item?.name}" has been removed.`, variant: "destructive" });
    };

    const handleOpenConfig = (integration: Integration) => {
        setConfigIntegration(integration);
        setConfigDialogOpen(true);
    };

    // ===== SECURITY FUNCTIONS =====
    const toggleSecurity = (id: string) => {
        setSecuritySettings((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, enabled: !item.enabled } : item
            )
        );
    };

    // ===== LOGS FUNCTIONS =====
    const handleRefreshLogs = () => {
        // Simulate refresh by shuffling timestamps
        const refreshedLogs = logs.map((log) => ({
            ...log,
            timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        }));
        setLogs(refreshedLogs);
        toast({ title: "Logs Refreshed", description: "System logs have been updated." });
    };

    // ===== COMPUTED VALUES =====
    const tabs: { key: TabType; label: string }[] = [
        { key: "integrations", label: "Integrations" },
        { key: "ai-models", label: "AI Models" },
        { key: "security", label: "Security" },
        { key: "logs", label: "System Logs" },
    ];

    const activeCount = integrations.filter((i) => i.enabled).length;
    const inactiveCount = integrations.filter((i) => !i.enabled).length;
    const filteredIntegrations = getFilteredAndSortedIntegrations();

    const getLogIcon = (level: string) => {
        switch (level) {
            case "success": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case "error": return <XCircle className="h-4 w-4 text-destructive" />;
            case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            default: return <Info className="h-4 w-4 text-primary" />;
        }
    };

    const getLogBg = (level: string) => {
        switch (level) {
            case "success": return "bg-green-500/5 border-green-500/20";
            case "error": return "bg-destructive/5 border-destructive/20";
            case "warning": return "bg-yellow-500/5 border-yellow-500/20";
            default: return "bg-primary/5 border-primary/20";
        }
    };

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">System Control</h1>
                        <p className="text-muted-foreground">
                            Manage integrations, AI models, and system configurations.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <DatePickerDemo />
                        <Button
                            className="gap-2 bg-primary hover:bg-primary/90"
                            onClick={() => setAddDialogOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Add Integration
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-border bg-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Activity className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Active Services</p>
                                <p className="text-2xl font-bold text-foreground">{activeCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                                <RefreshCw className="h-5 w-5 text-destructive" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Inactive Services</p>
                                <p className="text-2xl font-bold text-foreground">{inactiveCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Settings2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Integrations</p>
                                <p className="text-2xl font-bold text-foreground">{integrations.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center justify-between border-b border-border">
                    <div className="flex gap-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    "pb-3 text-sm font-medium transition-colors",
                                    activeTab === tab.key
                                        ? "border-b-2 border-primary text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 pb-3">
                        {/* Filter dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Filter className="h-4 w-4" />
                                    Filter
                                    {filter !== "all" && (
                                        <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                                            1
                                        </span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => setFilter("all")}
                                    className={cn(filter === "all" && "bg-accent")}
                                >
                                    All
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setFilter("active")}
                                    className={cn(filter === "active" && "bg-accent")}
                                >
                                    Active Only
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setFilter("inactive")}
                                    className={cn(filter === "inactive" && "bg-accent")}
                                >
                                    Inactive Only
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Sort dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <ArrowUpDown className="h-4 w-4" />
                                    Sort by
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => setSortBy("name-asc")}
                                    className={cn(sortBy === "name-asc" && "bg-accent")}
                                >
                                    Name (A-Z)
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setSortBy("name-desc")}
                                    className={cn(sortBy === "name-desc" && "bg-accent")}
                                >
                                    Name (Z-A)
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => setSortBy("status")}
                                    className={cn(sortBy === "status" && "bg-accent")}
                                >
                                    Status
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setSortBy("category")}
                                    className={cn(sortBy === "category" && "bg-accent")}
                                >
                                    Category
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* More options (three dots) */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleEnableAll}>
                                    <Power className="mr-2 h-4 w-4" />
                                    Enable All
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDisableAll}>
                                    <PowerOff className="mr-2 h-4 w-4" />
                                    Disable All
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleResetAll}>
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Reset to Default
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* ===== INTEGRATIONS TAB ===== */}
                {activeTab === "integrations" && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredIntegrations.length === 0 ? (
                            <div className="col-span-full rounded-lg border border-border bg-card p-8 text-center">
                                <Eye className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold text-foreground">No Integrations Found</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    No integrations match the current filter. Try changing the filter.
                                </p>
                            </div>
                        ) : (
                            filteredIntegrations.map((integration) => (
                                <div
                                    key={integration.id}
                                    className="rounded-lg border border-border bg-card p-5 transition-all duration-200 hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    "flex h-10 w-10 items-center justify-center rounded-lg",
                                                    integration.enabled ? "bg-primary/10" : "bg-muted"
                                                )}
                                            >
                                                <integration.icon
                                                    className={cn(
                                                        "h-5 w-5",
                                                        integration.enabled ? "text-primary" : "text-muted-foreground"
                                                    )}
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-foreground">
                                                    {integration.name}
                                                </h3>
                                                <span
                                                    className={cn(
                                                        "text-xs font-medium",
                                                        integration.enabled ? "text-primary" : "text-muted-foreground"
                                                    )}
                                                >
                                                    {integration.category}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Toggle Switch */}
                                        <button
                                            onClick={() => toggleIntegration(integration.id)}
                                            className={cn(
                                                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                                integration.enabled ? "bg-primary" : "bg-muted"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                                    integration.enabled ? "translate-x-5" : "translate-x-0"
                                                )}
                                            />
                                        </button>
                                    </div>

                                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                                        {integration.description}
                                    </p>

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    integration.status === "active"
                                                        ? "bg-green-500"
                                                        : integration.status === "error"
                                                            ? "bg-destructive"
                                                            : "bg-muted-foreground"
                                                )}
                                            />
                                            <span className="text-xs text-muted-foreground capitalize">
                                                {integration.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs text-muted-foreground hover:text-foreground"
                                                onClick={() => handleOpenConfig(integration)}
                                            >
                                                Configure
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                                        <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleOpenConfig(integration)}>
                                                        <Settings2 className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => toggleIntegration(integration.id)}>
                                                        {integration.enabled ? (
                                                            <><PowerOff className="mr-2 h-4 w-4" /> Disable</>
                                                        ) : (
                                                            <><Power className="mr-2 h-4 w-4" /> Enable</>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteIntegration(integration.id)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Remove
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* ===== AI MODELS TAB ===== */}
                {activeTab === "ai-models" && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {aiModels.map((model) => (
                                <div
                                    key={model.id}
                                    className="rounded-lg border border-border bg-card p-5 transition-all duration-200 hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "flex h-10 w-10 items-center justify-center rounded-lg",
                                                model.status === "active" ? "bg-primary/10" : "bg-muted"
                                            )}>
                                                <model.icon className={cn(
                                                    "h-5 w-5",
                                                    model.status === "active" ? "text-primary" : "text-muted-foreground"
                                                )} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-foreground">{model.name}</h3>
                                                <span className="text-xs text-muted-foreground">{model.provider}</span>
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                                            model.status === "active" ? "bg-green-500/10 text-green-600" :
                                                model.status === "fine-tuning" ? "bg-yellow-500/10 text-yellow-600" :
                                                    "bg-muted text-muted-foreground"
                                        )}>
                                            {model.status === "fine-tuning" ? "Fine-tuning" : model.status}
                                        </span>
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Version</span>
                                            <span className="font-medium text-foreground">{model.version}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Type</span>
                                            <span className="font-medium text-foreground">{model.type}</span>
                                        </div>
                                        {model.maxTokens > 0 && (
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">Max Tokens</span>
                                                <span className="font-medium text-foreground">{model.maxTokens.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "h-2 w-2 rounded-full",
                                                model.status === "active" ? "bg-green-500" :
                                                    model.status === "fine-tuning" ? "bg-yellow-500" : "bg-muted-foreground"
                                            )} />
                                            <span className="text-xs text-muted-foreground capitalize">{model.status}</span>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                                            Configure
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== SECURITY TAB ===== */}
                {activeTab === "security" && (
                    <div className="space-y-4">
                        {securitySettings.map((setting) => (
                            <div
                                key={setting.id}
                                className="flex items-center justify-between rounded-lg border border-border bg-card p-5 transition-all duration-200 hover:shadow-md"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-lg",
                                        setting.enabled ? "bg-primary/10" : "bg-muted"
                                    )}>
                                        <setting.icon className={cn(
                                            "h-5 w-5",
                                            setting.enabled ? "text-primary" : "text-muted-foreground"
                                        )} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-semibold text-foreground">{setting.name}</h3>
                                            <span className={cn(
                                                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                                setting.severity === "high" ? "bg-destructive/10 text-destructive" :
                                                    setting.severity === "medium" ? "bg-yellow-500/10 text-yellow-600" :
                                                        "bg-muted text-muted-foreground"
                                            )}>
                                                {setting.severity}
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-sm text-muted-foreground">{setting.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleSecurity(setting.id)}
                                    className={cn(
                                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                        setting.enabled ? "bg-primary" : "bg-muted"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                            setting.enabled ? "translate-x-5" : "translate-x-0"
                                        )}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* ===== SYSTEM LOGS TAB ===== */}
                {activeTab === "logs" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {logs.length} recent log entries
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={handleRefreshLogs}
                            >
                                <RefreshCw className="h-4 w-4" />
                                Refresh Logs
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    className={cn(
                                        "flex items-start gap-3 rounded-lg border p-4",
                                        getLogBg(log.level)
                                    )}
                                >
                                    <div className="mt-0.5">{getLogIcon(log.level)}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-medium text-foreground">{log.message}</span>
                                        </div>
                                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>{log.timestamp}</span>
                                            <span>•</span>
                                            <span className="font-medium">{log.source}</span>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize shrink-0",
                                        log.level === "success" ? "bg-green-500/10 text-green-600" :
                                            log.level === "error" ? "bg-destructive/10 text-destructive" :
                                                log.level === "warning" ? "bg-yellow-500/10 text-yellow-600" :
                                                    "bg-primary/10 text-primary"
                                    )}>
                                        {log.level}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ===== ADD INTEGRATION DIALOG ===== */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Integration</DialogTitle>
                        <DialogDescription>
                            Connect a new service or tool to your KiraAI system.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="int-name">
                                Integration Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="int-name"
                                placeholder="e.g., Slack Notifications"
                                value={newIntegration.name}
                                onChange={(e) =>
                                    setNewIntegration({ ...newIntegration, name: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="int-desc">
                                Description <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="int-desc"
                                placeholder="Describe what this integration does..."
                                value={newIntegration.description}
                                onChange={(e) =>
                                    setNewIntegration({ ...newIntegration, description: e.target.value })
                                }
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="int-category">Category</Label>
                                <Select
                                    value={newIntegration.category}
                                    onValueChange={(value) =>
                                        setNewIntegration({ ...newIntegration, category: value })
                                    }
                                >
                                    <SelectTrigger id="int-category">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoryOptions.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="int-icon">Icon</Label>
                                <Select
                                    value={newIntegration.iconKey}
                                    onValueChange={(value) =>
                                        setNewIntegration({ ...newIntegration, iconKey: value })
                                    }
                                >
                                    <SelectTrigger id="int-icon">
                                        <SelectValue placeholder="Select icon" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {iconOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                <div className="flex items-center gap-2">
                                                    <opt.icon className="h-4 w-4" />
                                                    {opt.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setAddDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAddIntegration}>
                            Add Integration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ===== CONFIGURE INTEGRATION DIALOG ===== */}
            <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Integration Details</DialogTitle>
                        <DialogDescription>
                            View and manage this integration's configuration.
                        </DialogDescription>
                    </DialogHeader>
                    {configIntegration && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "flex h-12 w-12 items-center justify-center rounded-lg",
                                    configIntegration.enabled ? "bg-primary/10" : "bg-muted"
                                )}>
                                    <configIntegration.icon className={cn(
                                        "h-6 w-6",
                                        configIntegration.enabled ? "text-primary" : "text-muted-foreground"
                                    )} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">{configIntegration.name}</h3>
                                    <span className={cn(
                                        "text-sm font-medium",
                                        configIntegration.enabled ? "text-primary" : "text-muted-foreground"
                                    )}>
                                        {configIntegration.category}
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-lg border border-border bg-muted/30 p-4">
                                <p className="text-sm text-muted-foreground">{configIntegration.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg border border-border p-3">
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <div className={cn(
                                            "h-2 w-2 rounded-full",
                                            configIntegration.status === "active" ? "bg-green-500" : "bg-muted-foreground"
                                        )} />
                                        <span className="text-sm font-medium text-foreground capitalize">{configIntegration.status}</span>
                                    </div>
                                </div>
                                <div className="rounded-lg border border-border p-3">
                                    <p className="text-xs text-muted-foreground">Enabled</p>
                                    <p className="mt-1 text-sm font-medium text-foreground">{configIntegration.enabled ? "Yes" : "No"}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setConfigDialogOpen(false)}
                        >
                            Close
                        </Button>
                        {configIntegration && (
                            <Button
                                onClick={() => {
                                    toggleIntegration(configIntegration.id);
                                    setConfigIntegration({
                                        ...configIntegration,
                                        enabled: !configIntegration.enabled,
                                        status: !configIntegration.enabled ? "active" : "inactive",
                                    });
                                }}
                            >
                                {configIntegration.enabled ? "Disable" : "Enable"}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
