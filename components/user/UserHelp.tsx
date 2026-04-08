"use client";

// Diff dari UserHelp.tsx yang lama:
// 1. Tambah props: isLoggedIn, userEmail, userName, onLoginRequest
// 2. Ganti bagian Contact Support dengan <ContactForm />
// 3. Hapus state form lokal (subject, message, sent) — sudah dihandle ContactForm

import { useState } from "react";
import {
  Search, ChevronDown, ChevronUp, Mail, MessageCircle,
  BookOpen, Zap, Shield, CheckCircle, Clock,
  AlertCircle, ArrowRight, Headphones,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ContactForm } from "@/components/help/ContactForm";

// ─── Props ────────────────────────────────────────────────────────────────────
interface UserHelpProps {
  isLoggedIn:     boolean;
  userEmail:      string;
  userName?:      string;
  onLoginRequest?: () => void;
}

// ─── Data (sama seperti sebelumnya) ──────────────────────────────────────────
const faqs = [
  { q: "How do I start a new conversation with LyraAI?",       a: "Click the '+ New Chat' button in the top-left sidebar. Each new chat starts a fresh conversation. You can also start typing directly in the input box on the main screen." },
  { q: "Can I access my chat history?",                         a: "Yes! Logged-in users can access their full chat history in the sidebar, organized by Today and Yesterday. Chat history is not available for guest users." },
  { q: "How do I switch between AI models?",                    a: "In the chat input area, click the model selector (showing 'GPT 3.5' by default) and choose from: GPT 3.5, GPT 4, GPT 4 Turbo, or Claude 3." },
  { q: "What is the difference between guest and logged-in users?", a: "Guest users can chat freely but history is not saved and features are limited. Logged-in users get full access to history, settings, and archived conversations." },
  { q: "How do I archive a conversation?",                      a: "You can archive conversations via the chat options. Archived chats appear in the 'Archived' section of the sidebar." },
  { q: "Is my conversation data private?",                      a: "Yes. Your conversations are private. Manage your data sharing settings in Settings → Notification." },
  { q: "How do I add an attachment to my message?",             a: "Click 'Add Attachment' below the chat input box. You can attach images, documents, and other file types." },
  { q: "What should I do if LyraAI gives an incorrect answer?", a: "Rephrase your question or provide more context. Always verify important information from trusted sources — AI can occasionally make mistakes." },
];

const quickCards = [
  { icon: BookOpen,   label: "Documentation", desc: "Step-by-step guides & API references", color: "text-blue-500",   bg: "bg-blue-500/10 group-hover:bg-blue-500/15"   },
  { icon: Zap,        label: "Quick Start",   desc: "Get up and running in minutes",        color: "text-yellow-500", bg: "bg-yellow-500/10 group-hover:bg-yellow-500/15" },
  { icon: Shield,     label: "Security FAQ",  desc: "Privacy, data & security explained",   color: "text-green-500",  bg: "bg-green-500/10 group-hover:bg-green-500/15"   },
  { icon: Headphones, label: "Live Support",  desc: "Talk to a real person right now",      color: "text-purple-500", bg: "bg-purple-500/10 group-hover:bg-purple-500/15" },
];

const shortcuts = [
  { keys: ["Enter"],        desc: "Send message"   },
  { keys: ["Shift", "Enter"], desc: "New line"     },
  { keys: ["⌘", "K"],      desc: "Open search"    },
  { keys: ["⌘", "N"],      desc: "New chat"       },
  { keys: ["Esc"],          desc: "Close dialogs"  },
];

const systemStatus = [
  { name: "AI Chat Service",  status: "operational" },
  { name: "Authentication",   status: "operational" },
  { name: "File Uploads",     status: "operational" },
  { name: "History Sync",     status: "degraded"    },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function UserHelp({ isLoggedIn, userEmail, userName, onLoginRequest }: UserHelpProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [search, setSearch]   = useState("");

  const filtered = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border px-6 py-10 md:py-14">
        <div className="relative mx-auto max-w-3xl text-center space-y-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mx-auto">
            <MessageCircle className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">How can we help you?</h1>
          <p className="text-muted-foreground text-sm md:text-base">Search our docs, browse FAQs, or contact our support team.</p>
          <div className="relative mx-auto max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for answers..."
              className="pl-11 h-11 rounded-xl border-border bg-background/80 backdrop-blur text-sm"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 md:px-6 py-8 space-y-10">
        {/* Quick Access Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {quickCards.map((c) => (
            <button
              key={c.label}
              className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 md:p-5 text-left transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition-colors", c.bg)}>
                <c.icon className={cn("h-5 w-5", c.color)} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{c.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed hidden sm:block">{c.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mt-auto" />
            </button>
          ))}
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Frequently Asked Questions</h2>
            <span className="text-xs text-muted-foreground">{filtered.length} results</span>
          </div>
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">No results for &ldquo;{search}&rdquo;</p>
            </div>
          )}
          <div className="space-y-2">
            {filtered.map((faq, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200",
                  openFaq === i && "border-primary/30 shadow-sm"
                )}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
                >
                  <span className="pr-4">{faq.q}</span>
                  <span className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors",
                    openFaq === i ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {openFaq === i ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="border-t border-border px-5 py-4 text-sm text-muted-foreground leading-relaxed bg-muted/20">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Shortcuts + System Status */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Keyboard Shortcuts</h2>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {shortcuts.map((s, i) => (
                <div key={s.desc} className={cn("flex items-center justify-between px-5 py-3", i !== shortcuts.length - 1 && "border-b border-border")}>
                  <span className="text-sm text-muted-foreground">{s.desc}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k) => (
                      <kbd key={k} className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-md border border-border bg-muted px-1.5 text-xs font-mono text-foreground">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">System Status</h2>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {systemStatus.map((s, i) => (
                <div key={s.name} className={cn("flex items-center justify-between px-5 py-3", i !== systemStatus.length - 1 && "border-b border-border")}>
                  <span className="text-sm text-foreground">{s.name}</span>
                  <div className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                    s.status === "operational" ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  )}>
                    {s.status === "operational"
                      ? <CheckCircle className="h-3 w-3" />
                      : <Clock className="h-3 w-3" />}
                    <span className="capitalize">{s.status}</span>
                  </div>
                </div>
              ))}
              <div className="px-5 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground">Last updated: just now</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Contact Support — pakai ContactForm ── */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" /> Contact Support
          </h2>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Form */}
              <ContactForm
                isLoggedIn={isLoggedIn}
                userEmail={userEmail}
                userName={userName}
                onLoginRequest={onLoginRequest}
              />

              {/* Other ways to reach */}
              <div className="space-y-4">
                <div className="rounded-xl bg-primary/5 border border-primary/15 p-4 space-y-3">
                  <p className="text-sm font-semibold text-foreground">Other ways to reach us</p>
                  {[
                    { icon: MessageCircle, label: "Live Chat",       sub: "Average wait: 2 mins"    },
                    { icon: Mail,          label: "Email Support",   sub: "support@LyraAI.com"      },
                    { icon: BookOpen,      label: "Community Forum", sub: "community.LyraAI.com"    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-muted/60 p-4">
                  <p className="text-xs font-semibold text-foreground mb-1">Response Times</p>
                  <p className="text-xs text-muted-foreground">Live Chat: &lt; 5 minutes</p>
                  <p className="text-xs text-muted-foreground">Email: 24–48 hours</p>
                  <p className="text-xs text-muted-foreground">Community: 1–3 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}