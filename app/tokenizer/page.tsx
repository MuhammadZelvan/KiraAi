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
  Copy,
  Trash2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Activity,
  Calculator,
  FileText,
  Clock,
  Download,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
  getTokenizerOverview,
  getTokenUsageHistory,
  getRecentTokenizations,
} from "@/lib/adminApi";
import { useAutoRefresh } from "@/hooks/use-autorefresh";

// ===== TYPES =====
interface TokenResult {
  tokens: number;
  characters: number;
  words: number;
  sentences: number;
  estimatedCostInput: number;
  estimatedCostOutput: number;
  contextUsagePct: number;
}

interface UsageRecord {
  date: string;
  tokens: number;
  requests: number;
  cost: number;
}

interface RecentItem {
  id: string;
  text: string;
  tokens: number;
  model: string;
  created_at: string;
}

interface Overview {
  tokens_today: number;
  tokens_today_growth: number;
  weekly_tokens: number;
  weekly_requests: number;
  weekly_cost: number;
  weekly_requests_growth: number;
  avg_tokens_per_request: number;
}

// ===== MODEL CONFIG (Grok 4.1 only) =====
const MODEL = {
  id: "grok-4.1",
  name: "Grok 4.1",
  provider: "xAI",
  tokensPerWord: 1.35,
  costPer1kInput: 0.000003, // $3/M tokens — update sesuai pricing xAI
  costPer1kOutput: 0.000015, // $15/M tokens
  maxContext: 131072,
};

// ===== HELPERS =====
function formatNum(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? "s" : ""} ago`;
}

function countWords(text: string) {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

function countSentences(text: string) {
  if (!text.trim()) return 0;
  return text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
}

function estimateTokens(text: string) {
  return Math.ceil(countWords(text) * MODEL.tokensPerWord);
}

// ===== COMPONENT =====
export default function TokenizerPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<
    "tokenizer" | "history" | "calculator"
  >("tokenizer");

  // Live tokenizer
  const [inputText, setInputText] = useState("");
  const [tokenResult, setTokenResult] = useState<TokenResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Calculator
  const [calcTokens, setCalcTokens] = useState("1000");

  // Remote data
  const [overview, setOverview] = useState<Overview | null>(null);
  const [history, setHistory] = useState<UsageRecord[]>([]);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    getTokenizerOverview()
      .then(setOverview)
      .catch(console.error)
      .finally(() => setLoadingOverview(false));

    getTokenUsageHistory()
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoadingHistory(false));

    getRecentTokenizations(5)
      .then(setRecent)
      .catch(console.error)
      .finally(() => setLoadingRecent(false));
  }, []);

  // Live tokenization debounced
  useEffect(() => {
    if (!inputText.trim()) {
      setTokenResult(null);
      return;
    }
    setIsAnalyzing(true);
    const t = setTimeout(() => {
      const tokens = estimateTokens(inputText);
      setTokenResult({
        tokens,
        characters: inputText.length,
        words: countWords(inputText),
        sentences: countSentences(inputText),
        estimatedCostInput: (tokens / 1000) * MODEL.costPer1kInput,
        estimatedCostOutput: (tokens / 1000) * MODEL.costPer1kOutput,
        contextUsagePct: (tokens / MODEL.maxContext) * 100,
      });
      setIsAnalyzing(false);
    }, 400);
    return () => clearTimeout(t);
  }, [inputText]);

  useAutoRefresh(() => {
    getTokenizerOverview().then(setOverview).catch(console.error);
    getTokenUsageHistory().then(setHistory).catch(console.error);
    getRecentTokenizations(5).then(setRecent).catch(console.error);
  });

  const handleCopy = () => {
    if (!tokenResult) return;
    const text = `Model: ${MODEL.name}\nTokens: ${tokenResult.tokens}\nWords: ${tokenResult.words}\nCharacters: ${tokenResult.characters}\nEstimated Cost (Input): $${tokenResult.estimatedCostInput.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Token analysis copied to clipboard.",
    });
  };

  const handleExportHistory = () => {
    const csv =
      "Date,Tokens,Requests,Cost\n" +
      history
        .map((r) => `${r.date},${r.tokens},${r.requests},${r.cost}`)
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `token-usage-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported!" });
  };

  const maxTokens = Math.max(...history.map((r) => r.tokens), 1);
  const totalRequestsWeek = history.reduce((s, r) => s + r.requests, 0);
  const totalCostWeek = history.reduce((s, r) => s + r.cost, 0);
  const avgTokensPerReq =
    totalRequestsWeek > 0
      ? Math.round(
          history.reduce((s, r) => s + r.tokens, 0) / totalRequestsWeek,
        )
      : 0;

  const calcCostInput =
    ((parseInt(calcTokens) || 0) / 1000) * MODEL.costPer1kInput;
  const calcCostOutput =
    ((parseInt(calcTokens) || 0) / 1000) * MODEL.costPer1kOutput;

  const tabs = [
    { key: "tokenizer" as const, label: "Live Tokenizer", icon: Cpu },
    { key: "history" as const, label: "Usage History", icon: BarChart3 },
    { key: "calculator" as const, label: "Cost Calculator", icon: Calculator },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tokenizer</h1>
            <p className="text-muted-foreground">
              Analyze, count, and estimate costs for Grok 4.1 tokens.
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportHistory}
          >
            <Download className="h-4 w-4" />
            Export Usage
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Tokens Today",
              value: loadingOverview
                ? "—"
                : formatNum(overview?.tokens_today ?? 0),
              growth: overview?.tokens_today_growth ?? 0,
              icon: Hash,
              color: "bg-primary/10",
              iconColor: "text-primary",
              suffix: "vs yesterday",
            },
            {
              label: "Weekly Cost",
              value: loadingOverview
                ? "—"
                : `$${(overview ? overview.weekly_cost : 0).toFixed(2)}`,
              growth: null,
              icon: DollarSign,
              color: "bg-success/10",
              iconColor: "text-success",
              suffix: "7 day total",
            },
            {
              label: "Weekly Requests",
              value: loadingOverview
                ? "—"
                : formatNum(overview?.weekly_requests ?? 0),
              growth: overview?.weekly_requests_growth ?? 0,
              icon: Activity,
              color: "bg-warning/10",
              iconColor: "text-warning",
              suffix: "vs last week",
            },
            {
              label: "Avg Tokens/Req",
              value: loadingOverview
                ? "—"
                : formatNum(overview?.avg_tokens_per_request ?? 0),
              growth: null,
              icon: Cpu,
              color: "bg-destructive/10",
              iconColor: "text-destructive",
              suffix: "this week",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-lg border border-border bg-card p-5"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-lg",
                    card.color,
                  )}
                >
                  <card.icon className={cn("h-6 w-6", card.iconColor)} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {card.value}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                {card.growth !== null ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 font-medium",
                      card.growth >= 0 ? "text-success" : "text-destructive",
                    )}
                  >
                    {card.growth >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {card.growth >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(card.growth).toFixed(1)}%
                  </span>
                ) : (
                  <span className="font-medium text-primary">
                    {card.suffix}
                  </span>
                )}
                {card.growth !== null && (
                  <span className="text-muted-foreground">{card.suffix}</span>
                )}
              </div>
            </div>
          ))}
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
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== LIVE TOKENIZER ===== */}
        {activeTab === "tokenizer" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Left */}
            <div className="lg:col-span-3 space-y-4">
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-semibold">Input Text</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {MODEL.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      disabled={!tokenResult}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setInputText("")}
                      disabled={!inputText}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <Textarea
                  placeholder="Paste or type your text here to analyze tokens..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px] resize-none border-border bg-background text-sm"
                />

                <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5 text-xs">
                  <div className="flex items-center gap-6">
                    <span className="text-muted-foreground">
                      Characters:{" "}
                      <span className="font-semibold text-foreground">
                        {inputText.length}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      Words:{" "}
                      <span className="font-semibold text-foreground">
                        {countWords(inputText)}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      Sentences:{" "}
                      <span className="font-semibold text-foreground">
                        {countSentences(inputText)}
                      </span>
                    </span>
                  </div>
                  {isAnalyzing && (
                    <div className="flex items-center gap-2 text-primary">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Analyzing...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="lg:col-span-2 space-y-4">
              {/* Token Analysis */}
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-semibold">
                    Token Analysis — {MODEL.name}
                  </h3>
                </div>

                {tokenResult ? (
                  <div className="space-y-4">
                    <div className="text-center py-4 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-4xl font-bold text-primary">
                        {formatNum(tokenResult.tokens)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Estimated Tokens
                      </p>
                    </div>

                    <div className="space-y-2">
                      {[
                        ["Characters", formatNum(tokenResult.characters)],
                        ["Words", formatNum(tokenResult.words)],
                        ["Sentences", String(tokenResult.sentences)],
                        [
                          "Tokens/Word",
                          tokenResult.words > 0
                            ? (tokenResult.tokens / tokenResult.words).toFixed(
                                2,
                              )
                            : "—",
                        ],
                        [
                          "Input Cost",
                          `$${tokenResult.estimatedCostInput.toFixed(6)}`,
                        ],
                        [
                          "Output Cost",
                          `$${tokenResult.estimatedCostOutput.toFixed(6)}`,
                        ],
                        ["Max Context", formatNum(MODEL.maxContext)],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between py-2 border-b border-border last:border-0"
                        >
                          <span className="text-sm text-muted-foreground">
                            {label}
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5 text-xs">
                        <span className="text-muted-foreground">
                          Context Window Usage
                        </span>
                        <span className="font-medium">
                          {tokenResult.contextUsagePct.toFixed(4)}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{
                            width: `${Math.min(tokenResult.contextUsagePct, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Cpu className="h-12 w-12 text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">
                      No Text Analyzed
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Type or paste text to start analyzing.
                    </p>
                  </div>
                )}
              </div>

              {/* Recent Tokenizations */}
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-semibold">Recent Chats</h3>
                </div>
                {loadingRecent ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : recent.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No recent chats.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recent.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => setInputText(item.text)}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Hash className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground truncate">
                            {item.text}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-semibold text-primary">
                              {item.tokens} tokens
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              • {item.model}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              • {timeAgo(item.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== USAGE HISTORY ===== */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-semibold">
                    Token Usage — Last 7 Days
                  </h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={handleExportHistory}
                >
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </Button>
              </div>

              {loadingHistory ? (
                <div className="flex justify-center h-48 items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex items-end gap-3 h-48">
                  {history.map((record, index) => {
                    const height =
                      maxTokens > 0 ? (record.tokens / maxTokens) * 100 : 0;
                    return (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center gap-2 group"
                      >
                        <div className="relative w-full flex justify-center">
                          <div className="absolute -top-16 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                            <div className="rounded-lg bg-foreground px-3 py-2 text-[10px] text-background shadow-lg whitespace-nowrap">
                              <p className="font-semibold">
                                {formatNum(record.tokens)} tokens
                              </p>
                              <p>
                                {record.requests} requests • $
                                {Number(record.cost).toFixed(4)}
                              </p>
                            </div>
                          </div>
                          <div
                            className="w-full max-w-12 rounded-t-lg bg-primary/80 hover:bg-primary transition-all duration-300 cursor-pointer"
                            style={{ height: `${height}%`, minHeight: "8px" }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {record.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="p-5 border-b border-border flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold">Detailed Usage</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {[
                        "Date",
                        "Tokens Used",
                        "Requests",
                        "Avg Tokens/Req",
                        "Cost",
                      ].map((h) => (
                        <th
                          key={h}
                          className={cn(
                            "px-5 py-3 text-xs font-semibold text-muted-foreground",
                            h === "Cost" ? "text-right" : "text-left",
                          )}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record, index) => (
                      <tr
                        key={index}
                        className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-medium">
                          {record.date}
                        </td>
                        <td className="px-5 py-3.5">
                          {formatNum(record.tokens)}
                        </td>
                        <td className="px-5 py-3.5">{record.requests}</td>
                        <td className="px-5 py-3.5">
                          {record.requests > 0
                            ? Math.round(record.tokens / record.requests)
                            : 0}
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold text-success">
                          ${Number(record.cost).toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/30 font-semibold">
                      <td className="px-5 py-3.5">Total</td>
                      <td className="px-5 py-3.5">
                        {formatNum(history.reduce((s, r) => s + r.tokens, 0))}
                      </td>
                      <td className="px-5 py-3.5">
                        {formatNum(totalRequestsWeek)}
                      </td>
                      <td className="px-5 py-3.5">{avgTokensPerReq}</td>
                      <td className="px-5 py-3.5 text-right text-success">
                        ${totalCostWeek.toFixed(4)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== COST CALCULATOR ===== */}
        {activeTab === "calculator" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calculator className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold">Token Cost Calculator</h3>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Number of Tokens
                  </label>
                  <Input
                    type="number"
                    value={calcTokens}
                    onChange={(e) => setCalcTokens(e.target.value)}
                    placeholder="Enter token count"
                    className="bg-background"
                  />
                </div>

                {/* Model info */}
                <div className="rounded-lg border border-primary bg-primary/5 p-4 flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {MODEL.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {MODEL.provider}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/30 p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Pricing Details
                  </p>
                  {[
                    [
                      "Input Cost / 1K tokens",
                      `$${MODEL.costPer1kInput.toFixed(6)}`,
                    ],
                    [
                      "Output Cost / 1K tokens",
                      `$${MODEL.costPer1kOutput.toFixed(6)}`,
                    ],
                    ["Max Context Window", formatNum(MODEL.maxContext)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <DollarSign className="h-5 w-5 text-success" />
                  <h3 className="text-sm font-semibold">Estimated Cost</h3>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      label: "Input Token Cost",
                      value: calcCostInput,
                      color: "primary",
                    },
                    {
                      label: "Output Token Cost",
                      value: calcCostOutput,
                      color: "success",
                    },
                    {
                      label: "Total (Input + Output)",
                      value: calcCostInput + calcCostOutput,
                      color: "foreground",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={cn(
                        "rounded-lg p-4 border",
                        item.color === "primary"
                          ? "bg-primary/5 border-primary/10"
                          : item.color === "success"
                            ? "bg-success/5 border-success/10"
                            : "bg-foreground/5 border-border",
                      )}
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        {item.label}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span
                          className={cn(
                            "text-3xl font-bold",
                            item.color === "primary"
                              ? "text-primary"
                              : item.color === "success"
                                ? "text-success"
                                : "text-foreground",
                          )}
                        >
                          ${item.value.toFixed(6)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          for {formatNum(parseInt(calcTokens || "0"))} tokens
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-warning" />
                  <h3 className="text-sm font-semibold">
                    Quick Estimates — {MODEL.name}
                  </h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: "100 req/day (avg 500 tokens)", tokens: 50000 },
                    { label: "1,000 req/day", tokens: 500000 },
                    { label: "10,000 req/day", tokens: 5000000 },
                  ].map((est, i) => {
                    const daily =
                      (est.tokens / 1000) *
                      (MODEL.costPer1kInput + MODEL.costPer1kOutput);
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/20 transition-colors"
                      >
                        <div>
                          <p className="text-xs font-medium">{est.label}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatNum(est.tokens)} tokens/day
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">
                            ${daily.toFixed(4)}/day
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            ${(daily * 30).toFixed(2)}/month
                          </p>
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
