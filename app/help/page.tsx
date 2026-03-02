"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    HelpCircle,
    Search,
    BookOpen,
    MessageCircle,
    Zap,
    Users,
    BarChart3,
    Key,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Send,
    CheckCircle2,
    AlertCircle,
    Clock,
    FileText,
    Keyboard,
    Activity,
    Cpu,
    Database,
    Mail,
    Server,
    Shield,
    Sparkles,
    Command,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

// ===== FAQ DATA =====
const faqData = [
    {
        category: "Getting Started",
        items: [
            {
                q: "How do I set up API keys for the AI chatbot?",
                a: "Navigate to the \"API Keys\" page from the sidebar. Click \"Generate New Key\", select the model provider (OpenAI, Anthropic, or Google), and provide a name. The key will be generated and you can copy it immediately. Remember to store it securely — it won't be shown again.",
            },
            {
                q: "What's the difference between the models (GPT-4, Claude, Gemini)?",
                a: "Each model has different strengths: GPT-4 Turbo excels at complex reasoning and coding tasks, Claude 3 Opus is great for nuanced conversations and long-context tasks, and Gemini Pro offers cost-efficient general-purpose capabilities. Use the Tokenizer page to compare token costs across models.",
            },
            {
                q: "How do I manage user access to the chatbot?",
                a: "Go to \"User Manage\" in the sidebar. Here you can add, edit, or remove users. You can assign roles (Admin, Editor, Viewer), set access levels for specific features, and manage user permissions. Bulk actions are available for managing multiple users at once.",
            },
        ],
    },
    {
        category: "Dashboard & Analytics",
        items: [
            {
                q: "How do I read the analytics charts?",
                a: "The Analytics page shows key metrics like total conversations, response times, user satisfaction, and token usage. Charts can be filtered by date range (7 days, 30 days, 90 days). Hover over any data point to see detailed information. Export options are available at the top right.",
            },
            {
                q: "What do the stat cards on the Dashboard mean?",
                a: "The Dashboard stat cards show real-time metrics: \"Total Users\" (active registered users), \"Conversations\" (total chat sessions), \"Response Rate\" (AI response success rate), and \"Satisfaction\" (user feedback score). The percentage change compares to the previous period.",
            },
            {
                q: "Can I export dashboard data?",
                a: "Yes! Most pages have an \"Export\" button. You can export data as CSV, PDF, or JSON depending on the page. Analytics can export chart data, User Manage can export user lists, and the Tokenizer can export usage history.",
            },
        ],
    },
    {
        category: "Security & Authentication",
        items: [
            {
                q: "How does admin authentication work?",
                a: "Admin access uses token-based authentication. You log in with your username and a secure admin token. This token is managed by the system administrator and can be regenerated in Settings > Security. Two-factor authentication (2FA) is available for additional security.",
            },
            {
                q: "How do I change my admin token?",
                a: "Go to Settings > Security > Authentication. Click \"Regenerate Token\". Warning: this will invalidate your current token and you'll need to log in again with the new token. Make sure to save the new token securely before regenerating.",
            },
            {
                q: "What happens if I see a failed login attempt?",
                a: "Failed login attempts are logged in Settings > Security > Login History. If you see suspicious activity (unknown IP, unusual location), we recommend regenerating your admin token immediately, enabling 2FA, and reviewing the IP whitelist settings.",
            },
        ],
    },
    {
        category: "Troubleshooting",
        items: [
            {
                q: "The AI chatbot is responding slowly, what should I check?",
                a: "Check the System Control page for real-time performance metrics. Common causes include: high token usage (near quota limits), network latency to the model provider, or model overload during peak hours. Try switching to a faster model (e.g., GPT-3.5 Turbo instead of GPT-4) for faster responses.",
            },
            {
                q: "API calls are failing with errors",
                a: "First, verify your API keys are valid in the API Keys page. Check if the key hasn't expired or reached its rate limit. Review the System Control page for any system-wide errors. If the issue persists, check the model provider's status page for outages.",
            },
            {
                q: "Dashboard data seems outdated or not refreshing",
                a: "Try refreshing the page (Ctrl+Shift+R). If data still seems stale, check the auto-refresh interval in Settings > General. You can also manually trigger data refresh using the refresh button on individual cards. Clear your browser cache if the issue persists.",
            },
        ],
    },
];

const documentationLinks = [
    {
        title: "API Documentation",
        description: "Complete API reference with endpoints, parameters, and response formats.",
        icon: FileText,
        url: "#",
        color: "bg-primary/10 text-primary",
    },
    {
        title: "Admin User Guide",
        description: "Step-by-step guide for managing your AI chatbot dashboard.",
        icon: BookOpen,
        url: "#",
        color: "bg-success/10 text-success",
    },
    {
        title: "Model Integration",
        description: "How to configure and integrate different AI models.",
        icon: Cpu,
        url: "#",
        color: "bg-warning/10 text-warning",
    },
    {
        title: "Security Best Practices",
        description: "Guidelines for securing your admin dashboard and API keys.",
        icon: Shield,
        url: "#",
        color: "bg-destructive/10 text-destructive",
    },
];

const shortcuts = [
    { keys: ["Ctrl", "K"], action: "Open Command Menu / Search" },
    { keys: ["Ctrl", "B"], action: "Toggle Sidebar" },
    { keys: ["Ctrl", ","], action: "Open Settings" },
    { keys: ["Ctrl", "/"], action: "Show Keyboard Shortcuts" },
    { keys: ["Esc"], action: "Close Modal / Dialog" },
    { keys: ["Ctrl", "E"], action: "Export Current Page Data" },
    { keys: ["Ctrl", "N"], action: "New Item (context-dependent)" },
];

const systemStatuses = [
    { name: "API Gateway", status: "operational" as const, uptime: "99.98%", icon: Server },
    { name: "Database", status: "operational" as const, uptime: "99.99%", icon: Database },
    { name: "AI Model Providers", status: "operational" as const, uptime: "99.95%", icon: Sparkles },
    { name: "Email Service", status: "degraded" as const, uptime: "99.80%", icon: Mail },
];

// ===== COMPONENT =====
export default function HelpSupportPage() {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [openFAQ, setOpenFAQ] = useState<string | null>(null);
    const [ticketSubject, setTicketSubject] = useState("");
    const [ticketPriority, setTicketPriority] = useState<"low" | "medium" | "high">("medium");
    const [ticketDescription, setTicketDescription] = useState("");
    const [activeSection, setActiveSection] = useState<"faq" | "docs" | "shortcuts" | "contact" | "status">("faq");

    const filteredFAQ = faqData.map((category) => ({
        ...category,
        items: category.items.filter(
            (item) =>
                item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.a.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    })).filter((category) => category.items.length > 0);

    const handleSubmitTicket = () => {
        if (!ticketSubject.trim() || !ticketDescription.trim()) {
            toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
            return;
        }
        toast({
            title: "Ticket Submitted!",
            description: `Your support ticket "${ticketSubject}" has been submitted. We'll respond within 24 hours.`,
        });
        setTicketSubject("");
        setTicketDescription("");
        setTicketPriority("medium");
    };

    const toggleFAQ = (id: string) => {
        setOpenFAQ(openFAQ === id ? null : id);
    };

    const sections = [
        { key: "faq" as const, label: "FAQ", icon: HelpCircle },
        { key: "docs" as const, label: "Documentation", icon: BookOpen },
        { key: "shortcuts" as const, label: "Shortcuts", icon: Keyboard },
        { key: "contact" as const, label: "Contact Support", icon: MessageCircle },
        { key: "status" as const, label: "System Status", icon: Activity },
    ];

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
                        <p className="text-muted-foreground">
                            Find answers, documentation, and get assistance.
                        </p>
                    </div>
                </div>

                {/* Getting Started Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/20 cursor-pointer group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3 group-hover:scale-105 transition-transform">
                            <Key className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">Setup API Keys</h3>
                        <p className="text-xs text-muted-foreground mt-1">Configure AI model access with API keys.</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/20 cursor-pointer group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 mb-3 group-hover:scale-105 transition-transform">
                            <Users className="h-5 w-5 text-success" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">Manage Users</h3>
                        <p className="text-xs text-muted-foreground mt-1">Add, edit, and control user access.</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/20 cursor-pointer group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 mb-3 group-hover:scale-105 transition-transform">
                            <BarChart3 className="h-5 w-5 text-warning" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">View Analytics</h3>
                        <p className="text-xs text-muted-foreground mt-1">Monitor performance and user trends.</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/20 cursor-pointer group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 mb-3 group-hover:scale-105 transition-transform">
                            <Cpu className="h-5 w-5 text-destructive" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">Configure AI Models</h3>
                        <p className="text-xs text-muted-foreground mt-1">Select and tune AI model parameters.</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (e.target.value) setActiveSection("faq");
                        }}
                        placeholder="Search for help articles, FAQ, or keywords..."
                        className="h-12 pl-12 text-sm bg-card border-border"
                    />
                </div>

                {/* Section Tabs */}
                <div className="flex items-center border-b border-border overflow-x-auto">
                    <div className="flex gap-4">
                        {sections.map((section) => (
                            <button
                                key={section.key}
                                onClick={() => setActiveSection(section.key)}
                                className={cn(
                                    "flex items-center gap-2 pb-3 text-sm font-medium transition-colors whitespace-nowrap",
                                    activeSection === section.key
                                        ? "border-b-2 border-primary text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <section.icon className="h-4 w-4" />
                                {section.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ===== FAQ Section ===== */}
                {activeSection === "faq" && (
                    <div className="space-y-6">
                        {(searchQuery ? filteredFAQ : faqData).map((category) => (
                            <div key={category.category} className="rounded-lg border border-border bg-card overflow-hidden">
                                <div className="px-5 py-3 bg-muted/30 border-b border-border">
                                    <h3 className="text-sm font-semibold text-foreground">{category.category}</h3>
                                </div>
                                <div className="divide-y divide-border">
                                    {category.items.map((item, index) => {
                                        const id = `${category.category}-${index}`;
                                        const isOpen = openFAQ === id;
                                        return (
                                            <div key={id}>
                                                <button
                                                    onClick={() => toggleFAQ(id)}
                                                    className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted/20"
                                                >
                                                    <span className="text-sm font-medium text-foreground pr-4">{item.q}</span>
                                                    {isOpen ? (
                                                        <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                    )}
                                                </button>
                                                {isOpen && (
                                                    <div className="px-5 pb-4">
                                                        <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {searchQuery && filteredFAQ.length === 0 && (
                            <div className="text-center py-12">
                                <HelpCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-sm font-medium text-muted-foreground">No results found for &quot;{searchQuery}&quot;</p>
                                <p className="text-xs text-muted-foreground mt-1">Try different keywords or contact support.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ===== Documentation Section ===== */}
                {activeSection === "docs" && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {documentationLinks.map((doc) => (
                            <a
                                key={doc.title}
                                href={doc.url}
                                className="group flex items-start gap-4 rounded-lg border border-border bg-card p-5 transition-all hover:bg-muted/20 hover:border-primary/30"
                            >
                                <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg shrink-0", doc.color)}>
                                    <doc.icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-semibold text-foreground">{doc.title}</h3>
                                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{doc.description}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                )}

                {/* ===== Keyboard Shortcuts Section ===== */}
                {activeSection === "shortcuts" && (
                    <div className="rounded-lg border border-border bg-card overflow-hidden">
                        <div className="px-5 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                            <Keyboard className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold text-foreground">Keyboard Shortcuts</h3>
                        </div>
                        <div className="divide-y divide-border">
                            {shortcuts.map((shortcut, index) => (
                                <div key={index} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/10 transition-colors">
                                    <span className="text-sm text-foreground">{shortcut.action}</span>
                                    <div className="flex items-center gap-1.5">
                                        {shortcut.keys.map((key, i) => (
                                            <span key={i}>
                                                <kbd className="rounded border border-border bg-muted px-2 py-1 text-xs font-mono font-semibold text-foreground shadow-sm">
                                                    {key === "Ctrl" ? (
                                                        <span className="flex items-center gap-0.5">
                                                            <Command className="h-3 w-3" />
                                                        </span>
                                                    ) : key}
                                                </kbd>
                                                {i < shortcut.keys.length - 1 && (
                                                    <span className="mx-1 text-xs text-muted-foreground">+</span>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== Contact Support Section ===== */}
                {activeSection === "contact" && (
                    <div className="rounded-lg border border-border bg-card p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <MessageCircle className="h-5 w-5 text-primary" />
                            <h3 className="text-sm font-semibold text-foreground">Submit a Support Ticket</h3>
                        </div>

                        <div className="space-y-5 max-w-2xl">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Subject *</label>
                                <Input
                                    value={ticketSubject}
                                    onChange={(e) => setTicketSubject(e.target.value)}
                                    placeholder="Brief description of your issue"
                                    className="bg-background"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Priority</label>
                                <div className="flex gap-3">
                                    {(["low", "medium", "high"] as const).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setTicketPriority(p)}
                                            className={cn(
                                                "rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-all",
                                                ticketPriority === p
                                                    ? p === "high"
                                                        ? "border-destructive bg-destructive/10 text-destructive ring-1 ring-destructive"
                                                        : p === "medium"
                                                            ? "border-warning bg-warning/10 text-warning ring-1 ring-warning"
                                                            : "border-success bg-success/10 text-success ring-1 ring-success"
                                                    : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                                            )}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Description *</label>
                                <Textarea
                                    value={ticketDescription}
                                    onChange={(e) => setTicketDescription(e.target.value)}
                                    placeholder="Describe the issue in detail. Include steps to reproduce if applicable..."
                                    className="min-h-[150px] resize-none bg-background"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Average response time: 4-8 hours
                                </p>
                                <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={handleSubmitTicket}>
                                    <Send className="h-4 w-4" />
                                    Submit Ticket
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== System Status Section ===== */}
                {activeSection === "status" && (
                    <div className="space-y-4">
                        {/* Overall Status */}
                        <div className="rounded-lg border border-border bg-card p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                                    <CheckCircle2 className="h-5 w-5 text-success" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">All Systems Operational</p>
                                    <p className="text-xs text-muted-foreground">Last checked: 2 minutes ago</p>
                                </div>
                            </div>
                        </div>

                        {/* Service Statuses */}
                        <div className="rounded-lg border border-border bg-card overflow-hidden">
                            <div className="px-5 py-3 bg-muted/30 border-b border-border">
                                <h3 className="text-sm font-semibold text-foreground">Service Status</h3>
                            </div>
                            <div className="divide-y divide-border">
                                {systemStatuses.map((service) => (
                                    <div key={service.name} className="flex items-center justify-between px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <service.icon className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium text-foreground">{service.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-muted-foreground">{service.uptime} uptime</span>
                                            <div className="flex items-center gap-1.5">
                                                {service.status === "operational" ? (
                                                    <>
                                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                                        <span className="text-xs font-medium text-success">Operational</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle className="h-4 w-4 text-warning" />
                                                        <span className="text-xs font-medium text-warning">Degraded</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Incident History */}
                        <div className="rounded-lg border border-border bg-card overflow-hidden">
                            <div className="px-5 py-3 bg-muted/30 border-b border-border">
                                <h3 className="text-sm font-semibold text-foreground">Recent Incidents</h3>
                            </div>
                            <div className="divide-y divide-border">
                                <div className="px-5 py-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertCircle className="h-3.5 w-3.5 text-warning" />
                                        <p className="text-sm font-medium text-foreground">Email Service Degraded Performance</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground ml-5.5">Feb 23, 2026 — Intermittent delays in email delivery. Investigation in progress.</p>
                                </div>
                                <div className="px-5 py-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                        <p className="text-sm font-medium text-foreground">Scheduled Database Maintenance</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground ml-5.5">Feb 20, 2026 — Completed successfully. No data loss.</p>
                                </div>
                                <div className="px-5 py-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                        <p className="text-sm font-medium text-foreground">API Gateway Update v2.4.1</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground ml-5.5">Feb 18, 2026 — Rolling update completed. Improved response time by 15%.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
