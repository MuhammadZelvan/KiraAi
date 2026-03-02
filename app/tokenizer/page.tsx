"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
    Cpu,
    Zap,
    DollarSign,
    BarChart3,
    Hash,
    ArrowRight,
    Copy,
    Trash2,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Info,
    Sparkles,
    Bot,
    Brain,
    Activity,
    ChevronDown,
    Calculator,
    FileText,
    Clock,
    Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ===== TYPES =====
interface TokenResult {
    model: string;
    tokens: number;
    characters: number;
    words: number;
    sentences: number;
    costPer1k: number;
    estimatedCost: number;
}

interface UsageRecord {
    date: string;
    tokens: number;
    requests: number;
    cost: number;
}

interface ModelInfo {
    id: string;
    name: string;
    provider: string;
    icon: React.ElementType;
    tokensPerWord: number; // average tokens per word ratio
    costPer1kInput: number;
    costPer1kOutput: number;
    maxContext: number;
    color: string;
}

// ===== DATA =====
const models: ModelInfo[] = [
    {
        id: "gpt4-turbo",
        name: "GPT-4 Turbo",
        provider: "OpenAI",
        icon: Bot,
        tokensPerWord: 1.35,
        costPer1kInput: 0.01,
        costPer1kOutput: 0.03,
        maxContext: 128000,
        color: "text-green-500",
    },
    {
        id: "gpt35-turbo",
        name: "GPT-3.5 Turbo",
        provider: "OpenAI",
        icon: Zap,
        tokensPerWord: 1.33,
        costPer1kInput: 0.0005,
        costPer1kOutput: 0.0015,
        maxContext: 16384,
        color: "text-blue-500",
    },
    {
        id: "claude3-opus",
        name: "Claude 3 Opus",
        provider: "Anthropic",
        icon: Brain,
        tokensPerWord: 1.38,
        costPer1kInput: 0.015,
        costPer1kOutput: 0.075,
        maxContext: 200000,
        color: "text-orange-500",
    },
    {
        id: "gemini-pro",
        name: "Gemini Pro",
        provider: "Google",
        icon: Sparkles,
        tokensPerWord: 1.30,
        costPer1kInput: 0.00025,
        costPer1kOutput: 0.0005,
        maxContext: 32768,
        color: "text-purple-500",
    },
];

const usageHistory: UsageRecord[] = [
    { date: "Feb 18", tokens: 125400, requests: 342, cost: 4.52 },
    { date: "Feb 19", tokens: 98200, requests: 287, cost: 3.41 },
    { date: "Feb 20", tokens: 156800, requests: 412, cost: 5.78 },
    { date: "Feb 21", tokens: 134500, requests: 358, cost: 4.89 },
    { date: "Feb 22", tokens: 178900, requests: 489, cost: 6.42 },
    { date: "Feb 23", tokens: 145200, requests: 398, cost: 5.21 },
    { date: "Feb 24", tokens: 89600, requests: 234, cost: 3.12 },
];

const recentTokenizations = [
    { id: "1", text: "What is the weather today?", tokens: 8, model: "GPT-4 Turbo", time: "2 min ago" },
    { id: "2", text: "Explain quantum computing in simple terms and provide examples of real-world applications", tokens: 18, model: "GPT-3.5 Turbo", time: "15 min ago" },
    { id: "3", text: "Write a professional email response to a customer complaint about late delivery", tokens: 16, model: "Claude 3 Opus", time: "32 min ago" },
    { id: "4", text: "Translate the following paragraph from English to Indonesian and maintain the formal tone", tokens: 17, model: "Gemini Pro", time: "1 hour ago" },
    { id: "5", text: "Summarize the key points of this 500-word article about artificial intelligence in healthcare", tokens: 19, model: "GPT-4 Turbo", time: "2 hours ago" },
];

// ===== HELPER FUNCTIONS =====
function formatNum(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function estimateTokens(text: string, ratio: number): number {
    if (!text.trim()) return 0;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words * ratio);
}

function countWords(text: string): number {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
}

function countSentences(text: string): number {
    if (!text.trim()) return 0;
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
}

// ===== COMPONENT =====
export default function TokenizerPage() {
    const { toast } = useToast();
    const [inputText, setInputText] = useState("");
    const [selectedModel, setSelectedModel] = useState<ModelInfo>(models[0]);
    const [tokenResults, setTokenResults] = useState<TokenResult[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [calcTokens, setCalcTokens] = useState("1000");
    const [calcModel, setCalcModel] = useState<ModelInfo>(models[0]);
    const [activeTab, setActiveTab] = useState<"tokenizer" | "history" | "calculator">("tokenizer");

    // Live tokenization on text change
    const analyzeTokens = useCallback(() => {
        if (!inputText.trim()) {
            setTokenResults([]);
            return;
        }

        setIsAnalyzing(true);

        // Simulate slight delay for realism
        setTimeout(() => {
            const results: TokenResult[] = models.map((model) => {
                const tokens = estimateTokens(inputText, model.tokensPerWord);
                return {
                    model: model.name,
                    tokens,
                    characters: inputText.length,
                    words: countWords(inputText),
                    sentences: countSentences(inputText),
                    costPer1k: model.costPer1kInput,
                    estimatedCost: (tokens / 1000) * model.costPer1kInput,
                };
            });
            setTokenResults(results);
            setIsAnalyzing(false);
        }, 300);
    }, [inputText]);

    useEffect(() => {
        const timer = setTimeout(() => {
            analyzeTokens();
        }, 500); // debounce

        return () => clearTimeout(timer);
    }, [inputText, analyzeTokens]);

    const handleCopy = () => {
        const result = tokenResults.find((r) => r.model === selectedModel.name);
        if (result) {
            const text = `Model: ${result.model}\nTokens: ${result.tokens}\nWords: ${result.words}\nCharacters: ${result.characters}\nEstimated Cost: $${result.estimatedCost.toFixed(6)}`;
            navigator.clipboard.writeText(text);
            toast({ title: "Copied!", description: "Token analysis copied to clipboard." });
        }
    };

    const handleClear = () => {
        setInputText("");
        setTokenResults([]);
    };

    const handleExportHistory = () => {
        const csv = "Date,Tokens,Requests,Cost\n" + usageHistory.map(r => `${r.date},${r.tokens},${r.requests},$${r.cost}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `token-usage-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: "Exported!", description: "Token usage history exported to CSV." });
    };

    // Stats calculation
    const totalTokensToday = usageHistory[usageHistory.length - 1]?.tokens || 0;
    const totalTokensYesterday = usageHistory[usageHistory.length - 2]?.tokens || 0;
    const tokenChange = totalTokensYesterday > 0
        ? ((totalTokensToday - totalTokensYesterday) / totalTokensYesterday * 100)
        : 0;

    const totalCostThisWeek = usageHistory.reduce((sum, r) => sum + r.cost, 0);
    const totalRequestsThisWeek = usageHistory.reduce((sum, r) => sum + r.requests, 0);
    const avgTokensPerRequest = Math.round(usageHistory.reduce((sum, r) => sum + r.tokens, 0) / totalRequestsThisWeek);

    const maxTokens = Math.max(...usageHistory.map((r) => r.tokens));

    const tabs = [
        { key: "tokenizer" as const, label: "Live Tokenizer", icon: Cpu },
        { key: "history" as const, label: "Usage History", icon: BarChart3 },
        { key: "calculator" as const, label: "Cost Calculator", icon: Calculator },
    ];

    const calcCostInput = (parseInt(calcTokens) || 0) / 1000 * calcModel.costPer1kInput;
    const calcCostOutput = (parseInt(calcTokens) || 0) / 1000 * calcModel.costPer1kOutput;

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Tokenizer</h1>
                        <p className="text-muted-foreground">
                            Analyze, count, and estimate costs for AI model tokens.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2" onClick={handleExportHistory}>
                            <Download className="h-4 w-4" />
                            Export Usage
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Token Today */}
                    <div className="rounded-lg border border-border bg-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <Hash className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Tokens Today</p>
                                <p className="text-2xl font-bold text-foreground">{formatNum(totalTokensToday)}</p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                            <span className={cn(
                                "inline-flex items-center gap-1 font-medium",
                                tokenChange >= 0 ? "text-destructive" : "text-success"
                            )}>
                                {tokenChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {tokenChange >= 0 ? "↑" : "↓"} {Math.abs(tokenChange).toFixed(1)}%
                            </span>
                            <span className="text-muted-foreground">vs yesterday</span>
                        </div>
                    </div>

                    {/* Weekly Cost */}
                    <div className="rounded-lg border border-border bg-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                                <DollarSign className="h-6 w-6 text-success" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Weekly Cost</p>
                                <p className="text-2xl font-bold text-foreground">${totalCostThisWeek.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                            <span className="font-medium text-primary">7 day total</span>
                            <span className="text-muted-foreground">From This Week</span>
                        </div>
                    </div>

                    {/* Total Requests */}
                    <div className="rounded-lg border border-border bg-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                                <Activity className="h-6 w-6 text-warning" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Weekly Requests</p>
                                <p className="text-2xl font-bold text-foreground">{formatNum(totalRequestsThisWeek)}</p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                            <span className="inline-flex items-center gap-1 font-medium text-success">
                                <TrendingUp className="h-3 w-3" /> ↑ 12.4%
                            </span>
                            <span className="text-muted-foreground">From Last Week</span>
                        </div>
                    </div>

                    {/* Avg Tokens/Request */}
                    <div className="rounded-lg border border-border bg-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                                <Cpu className="h-6 w-6 text-destructive" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Avg Tokens/Req</p>
                                <p className="text-2xl font-bold text-foreground">{avgTokensPerRequest}</p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                            <span className="inline-flex items-center gap-1 font-medium text-success">
                                <TrendingDown className="h-3 w-3" /> ↓ 5.2%
                            </span>
                            <span className="text-muted-foreground">Efficiency improving</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center border-b border-border">
                    <div className="flex gap-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    "flex items-center gap-2 pb-3 text-sm font-medium transition-colors",
                                    activeTab === tab.key
                                        ? "border-b-2 border-primary text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ===== LIVE TOKENIZER TAB ===== */}
                {activeTab === "tokenizer" && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                        {/* Left: Input Area */}
                        <div className="lg:col-span-3 space-y-4">
                            <div className="rounded-lg border border-border bg-card p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-primary" />
                                        <h3 className="text-sm font-semibold text-foreground">Input Text</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Model Selector */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="gap-2 text-xs">
                                                    <selectedModel.icon className={cn("h-3.5 w-3.5", selectedModel.color)} />
                                                    {selectedModel.name}
                                                    <ChevronDown className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {models.map((model) => (
                                                    <DropdownMenuItem
                                                        key={model.id}
                                                        onClick={() => setSelectedModel(model)}
                                                        className={cn(selectedModel.id === model.id && "bg-accent")}
                                                    >
                                                        <model.icon className={cn("mr-2 h-4 w-4", model.color)} />
                                                        <div>
                                                            <p className="text-sm">{model.name}</p>
                                                            <p className="text-[10px] text-muted-foreground">{model.provider}</p>
                                                        </div>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        <Button variant="ghost" size="sm" onClick={handleCopy} disabled={tokenResults.length === 0}>
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={handleClear} disabled={!inputText}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                <Textarea
                                    placeholder="Paste or type your text here to analyze tokens..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    className="min-h-[200px] resize-none border-border bg-background text-sm focus-visible:ring-primary/20"
                                />

                                {/* Live Stats Bar */}
                                <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5">
                                    <div className="flex items-center gap-6 text-xs">
                                        <span className="text-muted-foreground">
                                            Characters: <span className="font-semibold text-foreground">{inputText.length}</span>
                                        </span>
                                        <span className="text-muted-foreground">
                                            Words: <span className="font-semibold text-foreground">{countWords(inputText)}</span>
                                        </span>
                                        <span className="text-muted-foreground">
                                            Sentences: <span className="font-semibold text-foreground">{countSentences(inputText)}</span>
                                        </span>
                                    </div>
                                    {isAnalyzing && (
                                        <div className="flex items-center gap-2 text-xs text-primary">
                                            <RefreshCw className="h-3 w-3 animate-spin" />
                                            Analyzing...
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Model Comparison Table */}
                            {tokenResults.length > 0 && (
                                <div className="rounded-lg border border-border bg-card p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <BarChart3 className="h-5 w-5 text-primary" />
                                        <h3 className="text-sm font-semibold text-foreground">Model Comparison</h3>
                                    </div>

                                    <div className="space-y-3">
                                        {tokenResults.map((result, index) => {
                                            const model = models[index];
                                            const percentage = maxTokens > 0 ? (result.tokens / Math.max(...tokenResults.map(r => r.tokens))) * 100 : 0;
                                            return (
                                                <div key={result.model} className="space-y-1.5">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <model.icon className={cn("h-4 w-4", model.color)} />
                                                            <span className="font-medium text-foreground">{result.model}</span>
                                                            <span className="text-[10px] text-muted-foreground">({model.provider})</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-semibold text-foreground">{result.tokens} tokens</span>
                                                            <span className="text-xs text-muted-foreground">${result.estimatedCost.toFixed(6)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full transition-all duration-500 ease-out",
                                                                model.id === "gpt4-turbo" ? "bg-green-500" :
                                                                    model.id === "gpt35-turbo" ? "bg-blue-500" :
                                                                        model.id === "claude3-opus" ? "bg-orange-500" :
                                                                            "bg-purple-500"
                                                            )}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Token Results */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Selected Model Result */}
                            <div className="rounded-lg border border-border bg-card p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <selectedModel.icon className={cn("h-5 w-5", selectedModel.color)} />
                                    <h3 className="text-sm font-semibold text-foreground">Token Analysis — {selectedModel.name}</h3>
                                </div>

                                {tokenResults.length > 0 ? (
                                    (() => {
                                        const result = tokenResults.find(r => r.model === selectedModel.name);
                                        if (!result) return null;
                                        const contextUsage = (result.tokens / selectedModel.maxContext) * 100;
                                        return (
                                            <div className="space-y-4">
                                                {/* Big Token Count */}
                                                <div className="text-center py-4 rounded-lg bg-primary/5 border border-primary/10">
                                                    <p className="text-4xl font-bold text-primary">{result.tokens}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Estimated Tokens</p>
                                                </div>

                                                {/* Details */}
                                                <div className="space-y-2.5">
                                                    <div className="flex items-center justify-between py-2 border-b border-border">
                                                        <span className="text-sm text-muted-foreground">Characters</span>
                                                        <span className="text-sm font-medium text-foreground">{formatNum(result.characters)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2 border-b border-border">
                                                        <span className="text-sm text-muted-foreground">Words</span>
                                                        <span className="text-sm font-medium text-foreground">{formatNum(result.words)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2 border-b border-border">
                                                        <span className="text-sm text-muted-foreground">Sentences</span>
                                                        <span className="text-sm font-medium text-foreground">{result.sentences}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2 border-b border-border">
                                                        <span className="text-sm text-muted-foreground">Tokens/Word Ratio</span>
                                                        <span className="text-sm font-medium text-foreground">
                                                            {result.words > 0 ? (result.tokens / result.words).toFixed(2) : "—"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2 border-b border-border">
                                                        <span className="text-sm text-muted-foreground">Cost (Input)</span>
                                                        <span className="text-sm font-semibold text-success">${result.estimatedCost.toFixed(6)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between py-2">
                                                        <span className="text-sm text-muted-foreground">Max Context</span>
                                                        <span className="text-sm font-medium text-foreground">{formatNum(selectedModel.maxContext)}</span>
                                                    </div>
                                                </div>

                                                {/* Context Usage */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="text-xs text-muted-foreground">Context Window Usage</span>
                                                        <span className="text-xs font-medium text-foreground">{contextUsage.toFixed(4)}%</span>
                                                    </div>
                                                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-primary transition-all duration-500"
                                                            style={{ width: `${Math.min(contextUsage, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Cpu className="h-12 w-12 text-muted-foreground/30 mb-3" />
                                        <p className="text-sm font-medium text-muted-foreground">No Text Analyzed</p>
                                        <p className="text-xs text-muted-foreground mt-1">Type or paste text in the input area to start analyzing tokens.</p>
                                    </div>
                                )}
                            </div>

                            {/* Recent Tokenizations */}
                            <div className="rounded-lg border border-border bg-card p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="h-5 w-5 text-primary" />
                                    <h3 className="text-sm font-semibold text-foreground">Recent Tokenizations</h3>
                                </div>
                                <div className="space-y-3">
                                    {recentTokenizations.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/30 cursor-pointer"
                                            onClick={() => setInputText(item.text)}
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                                <Hash className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-foreground truncate">{item.text}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-semibold text-primary">{item.tokens} tokens</span>
                                                    <span className="text-[10px] text-muted-foreground">• {item.model}</span>
                                                    <span className="text-[10px] text-muted-foreground">• {item.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== USAGE HISTORY TAB ===== */}
                {activeTab === "history" && (
                    <div className="space-y-6">
                        {/* Chart */}
                        <div className="rounded-lg border border-border bg-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-primary" />
                                    <h3 className="text-sm font-semibold text-foreground">Token Usage — Last 7 Days</h3>
                                </div>
                                <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={handleExportHistory}>
                                    <Download className="h-3.5 w-3.5" />
                                    Export CSV
                                </Button>
                            </div>

                            {/* Simple Bar Chart */}
                            <div className="flex items-end gap-3 h-48">
                                {usageHistory.map((record, index) => {
                                    const height = (record.tokens / maxTokens) * 100;
                                    return (
                                        <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                                            <div className="relative w-full flex justify-center">
                                                {/* Tooltip */}
                                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                                                    <div className="rounded-lg bg-foreground px-3 py-2 text-[10px] text-background shadow-lg whitespace-nowrap">
                                                        <p className="font-semibold">{formatNum(record.tokens)} tokens</p>
                                                        <p>{record.requests} requests • ${record.cost.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                <div
                                                    className="w-full max-w-12 rounded-t-lg bg-primary/80 hover:bg-primary transition-all duration-300 cursor-pointer"
                                                    style={{ height: `${height}%`, minHeight: "8px" }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-medium">{record.date}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="rounded-lg border border-border bg-card overflow-hidden">
                            <div className="p-5 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <h3 className="text-sm font-semibold text-foreground">Detailed Usage</h3>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/30">
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Date</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Tokens Used</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Requests</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Avg Tokens/Req</th>
                                            <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usageHistory.map((record, index) => (
                                            <tr key={index} className="border-b border-border last:border-0 transition-colors hover:bg-muted/20">
                                                <td className="px-5 py-3.5 font-medium text-foreground">{record.date}</td>
                                                <td className="px-5 py-3.5 text-foreground">{formatNum(record.tokens)}</td>
                                                <td className="px-5 py-3.5 text-foreground">{record.requests}</td>
                                                <td className="px-5 py-3.5 text-foreground">{Math.round(record.tokens / record.requests)}</td>
                                                <td className="px-5 py-3.5 text-right font-semibold text-success">${record.cost.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-muted/30 font-semibold">
                                            <td className="px-5 py-3.5 text-foreground">Total</td>
                                            <td className="px-5 py-3.5 text-foreground">{formatNum(usageHistory.reduce((s, r) => s + r.tokens, 0))}</td>
                                            <td className="px-5 py-3.5 text-foreground">{formatNum(totalRequestsThisWeek)}</td>
                                            <td className="px-5 py-3.5 text-foreground">{avgTokensPerRequest}</td>
                                            <td className="px-5 py-3.5 text-right text-success">${totalCostThisWeek.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== COST CALCULATOR TAB ===== */}
                {activeTab === "calculator" && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Calculator Input */}
                        <div className="rounded-lg border border-border bg-card p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Calculator className="h-5 w-5 text-primary" />
                                <h3 className="text-sm font-semibold text-foreground">Token Cost Calculator</h3>
                            </div>

                            <div className="space-y-5">
                                {/* Token Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Number of Tokens</label>
                                    <Input
                                        type="number"
                                        value={calcTokens}
                                        onChange={(e) => setCalcTokens(e.target.value)}
                                        placeholder="Enter token count"
                                        className="bg-background"
                                    />
                                </div>

                                {/* Model Selector */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Select Model</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {models.map((model) => (
                                            <button
                                                key={model.id}
                                                onClick={() => setCalcModel(model)}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-lg border p-3 transition-all duration-200",
                                                    calcModel.id === model.id
                                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                        : "border-border bg-background hover:bg-muted/50"
                                                )}
                                            >
                                                <model.icon className={cn("h-5 w-5", model.color)} />
                                                <div className="text-left">
                                                    <p className="text-xs font-semibold text-foreground">{model.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">{model.provider}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Pricing Info */}
                                <div className="rounded-lg bg-muted/30 p-4 space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pricing Details</p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Input Cost / 1K tokens</span>
                                        <span className="font-medium text-foreground">${calcModel.costPer1kInput.toFixed(5)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Output Cost / 1K tokens</span>
                                        <span className="font-medium text-foreground">${calcModel.costPer1kOutput.toFixed(5)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Max Context Window</span>
                                        <span className="font-medium text-foreground">{formatNum(calcModel.maxContext)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Calculator Result */}
                        <div className="space-y-4">
                            <div className="rounded-lg border border-border bg-card p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <DollarSign className="h-5 w-5 text-success" />
                                    <h3 className="text-sm font-semibold text-foreground">Estimated Cost</h3>
                                </div>

                                <div className="space-y-4">
                                    {/* Input Cost */}
                                    <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
                                        <p className="text-xs text-muted-foreground mb-1">Input Token Cost</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-primary">${calcCostInput.toFixed(4)}</span>
                                            <span className="text-xs text-muted-foreground">for {formatNum(parseInt(calcTokens || "0"))} tokens</span>
                                        </div>
                                    </div>

                                    {/* Output Cost */}
                                    <div className="rounded-lg bg-success/5 border border-success/10 p-4">
                                        <p className="text-xs text-muted-foreground mb-1">Output Token Cost</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-success">${calcCostOutput.toFixed(4)}</span>
                                            <span className="text-xs text-muted-foreground">for {formatNum(parseInt(calcTokens || "0"))} tokens</span>
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="rounded-lg bg-foreground/5 border border-border p-4">
                                        <p className="text-xs text-muted-foreground mb-1">Total (Input + Output)</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-foreground">${(calcCostInput + calcCostOutput).toFixed(4)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Estimates */}
                            <div className="rounded-lg border border-border bg-card p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Zap className="h-5 w-5 text-warning" />
                                    <h3 className="text-sm font-semibold text-foreground">Quick Estimates — {calcModel.name}</h3>
                                </div>
                                <div className="space-y-2.5">
                                    {[
                                        { label: "100 requests/day (avg 500 tokens each)", tokens: 50000 },
                                        { label: "1,000 requests/day", tokens: 500000 },
                                        { label: "10,000 requests/day", tokens: 5000000 },
                                    ].map((estimate, index) => {
                                        const dailyCost = (estimate.tokens / 1000) * (calcModel.costPer1kInput + calcModel.costPer1kOutput);
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/20"
                                            >
                                                <div>
                                                    <p className="text-xs font-medium text-foreground">{estimate.label}</p>
                                                    <p className="text-[10px] text-muted-foreground">{formatNum(estimate.tokens)} tokens/day</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-foreground">${dailyCost.toFixed(2)}/day</p>
                                                    <p className="text-[10px] text-muted-foreground">${(dailyCost * 30).toFixed(2)}/month</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
