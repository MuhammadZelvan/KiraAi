"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ChevronDown, Save, Check, Loader2,
  Brain, Plus, Trash2, Pencil, X, CheckCircle2,
  AlertCircle, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSettings, saveSettings, logout, getMe } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface UserSettingsProps {
  onSettingsSaved?: () => void;
}

interface Memory {
  id: string;
  content: string;
}

// ─── Memory Tab ───────────────────────────────────────────────────────────────
function MemoryTab() {
  const [memories, setMemories]       = useState<Memory[]>([]);
  const [loading, setLoading]         = useState(true);
  const [adding, setAdding]           = useState(false);
  const [newContent, setNewContent]   = useState("");
  const [savingNew, setSavingNew]     = useState(false);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit]   = useState(false);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [error, setError]             = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch memories
  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/memories`, { credentials: "include" });
      const data = await res.json();
      setMemories(data.memories ?? []);
    } catch {
      setError("Gagal memuat memory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMemories(); }, []);

  // Add memory
  const handleAdd = async () => {
    if (!newContent.trim() || newContent.trim().length < 3) {
      setError("Memory minimal 3 karakter.");
      return;
    }
    setSavingNew(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/memories`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent.trim() }),
      });
      if (!res.ok) throw new Error();
      setNewContent("");
      setAdding(false);
      await fetchMemories();
    } catch {
      setError("Gagal menambah memory.");
    } finally {
      setSavingNew(false);
    }
  };

  // Start edit
  const startEdit = (memory: Memory) => {
    setEditingId(memory.id);
    setEditContent(memory.content);
    setError("");
  };

  // Save edit
  const handleEdit = async (id: string) => {
    if (!editContent.trim()) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`${API_URL}/memories/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      if (!res.ok) throw new Error();
      setEditingId(null);
      await fetchMemories();
    } catch {
      setError("Gagal menyimpan memory.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete memory
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`${API_URL}/memories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch {
      setError("Gagal menghapus memory.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Memory
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            LyraAI mengingat hal-hal ini tentang kamu untuk memberikan respons yang lebih personal.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => { setAdding(true); setError(""); setTimeout(() => textareaRef.current?.focus(), 50); }}
          className="gap-1.5 shrink-0"
          disabled={adding}
        >
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Add new memory form */}
      {adding && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            Memory baru
          </div>
          <Textarea
            ref={textareaRef}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Contoh: Saya seorang developer yang suka Python dan sering kerja larut malam"
            className="min-h-[80px] resize-none bg-background border-border/60 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAdd();
              if (e.key === "Escape") { setAdding(false); setNewContent(""); }
            }}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">⌘+Enter untuk simpan · Esc untuk batal</p>
            <div className="flex gap-2">
              <Button
                size="sm" variant="ghost"
                onClick={() => { setAdding(false); setNewContent(""); setError(""); }}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={savingNew || !newContent.trim()}
                className="gap-1.5"
              >
                {savingNew ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Memory list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : memories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Brain className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Belum ada memory</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tambah memory agar LyraAI bisa mengenalmu lebih baik.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {memories.map((memory, index) => (
            <div
              key={memory.id}
              className={cn(
                "group rounded-xl border border-border bg-card transition-all duration-200 hover:border-border/80 hover:shadow-sm",
                editingId === memory.id && "border-primary/30 bg-primary/5"
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {editingId === memory.id ? (
                // Edit mode
                <div className="p-4 space-y-3">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[72px] resize-none bg-background border-border/60 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleEdit(memory.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Batal
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleEdit(memory.id)}
                      disabled={savingEdit || !editContent.trim()}
                      className="gap-1.5"
                    >
                      {savingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      Simpan
                    </Button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <div className="mt-0.5 h-5 w-5 shrink-0 flex items-center justify-center rounded-full bg-primary/10">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                  <p className="flex-1 text-sm text-foreground leading-relaxed">{memory.content}</p>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => startEdit(memory)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(memory.id)}
                      disabled={deletingId === memory.id}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      {deletingId === memory.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />
                      }
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Count */}
      {memories.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          {memories.length} memory tersimpan
        </p>
      )}
    </div>
  );
}

// ─── Main UserSettings Component ──────────────────────────────────────────────
export function UserSettings({ onSettingsSaved }: UserSettingsProps) {
  const { setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("general");

  const load = (key: string, fallback: string) =>
    typeof window !== "undefined" ? (localStorage.getItem(`lyra_${key}`) ?? fallback) : fallback;
  const loadBool = (key: string, fallback: boolean) =>
    typeof window !== "undefined"
      ? localStorage.getItem(`lyra_${key}`) !== null
        ? localStorage.getItem(`lyra_${key}`) === "true"
        : fallback
      : fallback;

  const [fullName, setFullName]               = useState(() => load("fullName", "Zelvan"));
  const [callName, setCallName]               = useState(() => load("callName", "Zelvan"));
  const [occupation, setOccupation]           = useState(() => load("occupation", ""));
  const [preferences, setPreferences]         = useState(() => load("preferences", ""));
  const [notifyCompletion, setNotifyCompletion] = useState(() => loadBool("notifyCompletion", false));
  const [colorMode, setColorMode]             = useState(() => load("colorMode", "auto"));
  const [chatFont, setChatFont]               = useState(() => load("chatFont", "Default"));

  const [saved, setSaved] = useState({ fullName, callName, occupation, preferences, notifyCompletion, colorMode, chatFont });
  const [isDirty, setIsDirty]   = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const [data, me] = await Promise.all([getSettings(), getMe()]);
      const newSettings = {
        fullName:         data?.full_name || me?.name || "",
        callName:         data?.call_name || me?.username || "",
        occupation:       data?.occupation ?? "",
        preferences:      data?.preferences ?? "",
        notifyCompletion: data?.notify_completion ?? false,
        colorMode:        data?.color_mode ?? "auto",
        chatFont:         data?.chat_font ?? "Default",
      };
      setFullName(newSettings.fullName);
      setCallName(newSettings.callName);
      setOccupation(newSettings.occupation);
      setPreferences(newSettings.preferences);
      setNotifyCompletion(newSettings.notifyCompletion);
      setColorMode(newSettings.colorMode);
      setChatFont(newSettings.chatFont);
      setSaved(newSettings);
    }
    loadSettings();
  }, []);

  useEffect(() => {
    const changed =
      fullName !== saved.fullName || callName !== saved.callName ||
      occupation !== saved.occupation || preferences !== saved.preferences ||
      notifyCompletion !== saved.notifyCompletion ||
      colorMode !== saved.colorMode || chatFont !== saved.chatFont;
    setIsDirty(changed);
    if (changed) setJustSaved(false);
  }, [fullName, callName, occupation, preferences, notifyCompletion, colorMode, chatFont, saved]);

  useEffect(() => {
    const map: Record<string, string> = { light: "light", dark: "dark", auto: "system" };
    setTheme(map[colorMode] ?? "system");
  }, [colorMode, setTheme]);

  useEffect(() => {
    const fontMap: Record<string, string> = {
      Default: "'Georgia', serif",
      Sans: "'Inter', sans-serif",
      System: "system-ui, sans-serif",
      "Dyslexic friendly": "'OpenDyslexic', 'Comic Sans MS', cursive",
    };
    document.documentElement.style.setProperty("--chat-font", fontMap[chatFont] ?? fontMap.Default);
  }, [chatFont]);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("lyra_fullName");
      localStorage.removeItem("lyra_callName");
      window.dispatchEvent(new Event("conversations-updated"));
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveSettings({ fullName, callName, occupation, preferences, notifyCompletion, colorMode, chatFont, searchEnabled: true });
      setSaved({ fullName, callName, occupation, preferences, notifyCompletion, colorMode, chatFont });
      setJustSaved(true);
      setIsDirty(false);
      onSettingsSaved?.();
    } catch (err) {
      console.error("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General" },
    { id: "memory",  label: "Memory"  },
    { id: "account", label: "Account" },
  ];

  return (
    <div className="flex justify-center h-full bg-background overflow-y-auto w-full relative">
      <div className="flex flex-col md:flex-row w-full max-w-5xl px-4 md:px-8 py-10 gap-x-12">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-56 shrink-0 flex flex-col mb-8 md:mb-0">
          <h1 className="text-2xl font-serif text-foreground mb-8 pl-4">Settings</h1>
          <div className="flex flex-row md:flex-col gap-1 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap text-left",
                  activeTab === tab.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                {tab.id === "memory" && <Brain className="h-4 w-4 mr-2 shrink-0" />}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full max-w-3xl pb-24 relative">

          {/* ── General Tab ── */}
          {activeTab === "general" && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full name</label>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-muted flex items-center justify-center border border-border">
                        <span className="text-sm font-semibold text-foreground uppercase">{fullName.charAt(0) || "Z"}</span>
                      </div>
                      <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11 bg-background border-border/60" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">What should LyraAI call you?</label>
                    <Input value={callName} onChange={(e) => setCallName(e.target.value)} className="h-11 bg-background border-border/60" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">What best describes your work?</label>
                  <div className="relative">
                    <select value={occupation} onChange={(e) => setOccupation(e.target.value)} className="w-full h-11 px-3 rounded-md border border-border/60 bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer">
                      <option value="" disabled>Select your work function</option>
                      <option value="student">Student</option>
                      <option value="developer">Software Developer</option>
                      <option value="designer">Creative / Designer</option>
                      <option value="marketing">Marketing / Business</option>
                      <option value="other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    What <span className="underline decoration-muted-foreground/50 underline-offset-4 cursor-help text-foreground/90">personal preferences</span> should LyraAI consider in responses?
                  </label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your preferences will apply to all conversations, within <span className="underline decoration-muted-foreground/50 underline-offset-4 cursor-help text-foreground/90">LyraAI's guidelines</span>.
                  </p>
                  <Textarea value={preferences} onChange={(e) => setPreferences(e.target.value)} placeholder="e.g. I primarily code in Python (not a coding beginner)" className="min-h-[120px] resize-none bg-background py-3 mt-2 border-border/60" />
                </div>
              </div>

              <div className="w-full h-px bg-border/40" />

              <div className="space-y-4">
                <h3 className="text-base font-bold text-foreground tracking-tight">Notifications</h3>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Response completions</h4>
                    <p className="text-[13px] text-muted-foreground mt-1 max-w-[85%]">Get notified when LyraAI has finished a response. Most useful for long-running tasks like tool calls and Research.</p>
                  </div>
                  <Switch checked={notifyCompletion} onCheckedChange={setNotifyCompletion} className="mt-0.5" />
                </div>
              </div>

              <div className="w-full h-px bg-border/40" />

              <div className="space-y-5">
                <h3 className="text-base font-bold text-foreground tracking-tight">Appearance</h3>
                <div className="space-y-3">
                  <label className="text-[13px] font-medium text-foreground">Color mode</label>
                  <div className="flex flex-wrap items-center gap-5 pt-1">
                    {/* Light */}
                    <div className="flex flex-col items-center gap-3">
                      <button onClick={() => setColorMode("light")} className={cn("relative w-32 h-[84px] rounded-xl border flex flex-col overflow-hidden transition-all bg-[#f4f5f9] p-2.5", colorMode === "light" ? "border-primary ring-1 ring-primary" : "border-border/60 hover:border-foreground/30")}>
                        <div className="w-10 h-1 rounded-full bg-black/20 self-end mt-1" />
                        <div className="flex flex-col gap-[5px] mt-4 px-1"><div className="w-16 h-1 rounded-full bg-black/10" /><div className="w-10 h-1 rounded-full bg-black/10" /></div>
                        <div className="w-full h-[22px] mt-auto rounded-md bg-white border border-black/5 flex items-center justify-end px-2 shadow-sm"><div className="w-1.5 h-1.5 rounded-full bg-[#6E42FD]" /></div>
                      </button>
                      <span className="text-[13px] text-muted-foreground">Light</span>
                    </div>
                    {/* Auto */}
                    <div className="flex flex-col items-center gap-3">
                      <button onClick={() => setColorMode("auto")} className={cn("relative w-32 h-[84px] rounded-xl border flex flex-col overflow-hidden transition-all", colorMode === "auto" ? "border-primary ring-1 ring-primary" : "border-border/60 hover:border-foreground/30")}>
                        <div className="flex flex-1 w-full h-full">
                          <div className="w-1/2 bg-indigo-50/50 border-r border-border/20 flex flex-col p-2.5 overflow-hidden"><div className="flex flex-col gap-[5px] mt-4"><div className="w-[120px] h-1 rounded-full bg-black/10" /><div className="w-[80px] h-1 rounded-full bg-black/10" /></div><div className="w-[180px] h-[22px] mt-auto rounded bg-white flex-shrink-0 border border-black/5 shadow-sm" /></div>
                          <div className="w-1/2 bg-[#18181b] flex flex-col p-2.5 relative overflow-hidden"><div className="w-10 h-1 rounded-full bg-white/20 self-end mt-1 absolute right-2.5 top-3.5" /><div className="w-full h-[22px] mt-auto rounded bg-[#27272a] flex items-center justify-end px-1.5 border border-white/5 shadow-sm absolute right-2.5 bottom-2.5 min-w-[55px]"><div className="w-1.5 h-1.5 rounded-full bg-[#6E42FD]" /></div></div>
                        </div>
                      </button>
                      <span className="text-[13px] text-muted-foreground">Auto</span>
                    </div>
                    {/* Dark */}
                    <div className="flex flex-col items-center gap-3">
                      <button onClick={() => setColorMode("dark")} className={cn("relative w-32 h-[84px] rounded-xl border flex flex-col overflow-hidden transition-all bg-[#18181b] p-2.5", colorMode === "dark" ? "border-primary ring-1 ring-primary" : "border-border/60 hover:border-foreground/30")}>
                        <div className="w-10 h-1 rounded-full bg-white/20 self-end mt-1" />
                        <div className="flex flex-col gap-[5px] mt-4 px-1"><div className="w-16 h-1 rounded-full bg-white/10" /><div className="w-10 h-1 rounded-full bg-white/10" /></div>
                        <div className="w-full h-[22px] mt-auto rounded-md bg-[#27272a] border border-white/5 flex items-center justify-end px-2 shadow-sm"><div className="w-1.5 h-1.5 rounded-full bg-[#6E42FD]" /></div>
                      </button>
                      <span className="text-[13px] text-muted-foreground">Dark</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-[13px] font-medium text-foreground">Chat font</h3>
                <div className="flex flex-wrap gap-4 pt-1">
                  {["Default", "Sans", "System", "Dyslexic friendly"].map((font) => (
                    <div key={font} className="flex flex-col items-center gap-3">
                      <button onClick={() => setChatFont(font)} className={cn("h-[84px] w-28 rounded-xl border flex items-center justify-center transition-all bg-card shadow-sm", chatFont === font ? "border-primary ring-1 ring-primary bg-primary/5" : "border-border/60 hover:border-foreground/30")}>
                        <span className={cn("text-[28px] text-foreground/90", font === "Sans" ? "font-sans" : font === "System" ? "font-system" : "font-serif")}>Aa</span>
                      </button>
                      <span className="text-[13px] text-muted-foreground">{font}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Memory Tab ── */}
          {activeTab === "memory" && <MemoryTab />}

          {/* ── Account Tab ── */}
          {activeTab === "account" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-foreground mb-6">Account</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm font-medium text-foreground">Log out of all devices</span>
                  <Button variant="outline" size="sm" className="rounded-md" onClick={handleLogout}>Log out</Button>
                </div>
                <div className="flex items-center justify-between py-1 border-t border-border/40 pt-5">
                  <span className="text-sm font-medium text-foreground">Delete your account</span>
                  <Button variant="secondary" size="sm" className="bg-white text-black hover:bg-gray-100 rounded-md">Delete account</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Save Button — hanya muncul di General tab */}
      {activeTab === "general" && (
        <div className="fixed bottom-8 right-8 md:bottom-12 md:right-12 z-50 pointer-events-none">
          <div className={cn("transition-all duration-500 transform pointer-events-auto", isDirty || justSaved ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none")}>
            <Button
              onClick={handleSave}
              disabled={isSaving || justSaved}
              className={cn(
                "rounded-xl px-7 shadow-xl shadow-primary/20 text-[15px] font-medium h-[52px] flex items-center gap-3 overflow-hidden transition-all duration-300 relative",
                justSaved ? "bg-green-600 hover:bg-green-600 text-white" : "bg-[#6E42FD] hover:bg-[#5c37d6] text-white hover:-translate-y-1",
              )}
            >
              {isSaving ? <><Loader2 className="h-5 w-5 animate-spin" />Saving...</>
                : justSaved ? <><Check className="h-5 w-5 animate-in zoom-in" />Changes Saved</>
                : <><Save className="h-5 w-5" />Save Changes</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}