"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Mic, ArrowUp, Paperclip, Settings2, Globe, ChevronDown,
  MessageCircle, PowerOff, Wrench, Zap, Pencil, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { sendChat, getChatHistory, streamChat, getQuotaUsage, getChatModels, deleteMessage, rewindMessage } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image_url?: string | null;
}

interface RecentChat {
  id: string;
  title: string;
  created_at: string;
}

interface ChatInterfaceProps {
  userName?: string;
  activeChatId?: string | null;
  isGuest?: boolean;
  onLoginRequest?: () => void;
  recentChats?: RecentChat[];
  onChatSelect?: (id: string) => void;
  onFirstMessage?: (text: string) => void;
  onChatCreated?: (id: string) => void;
}



type ServiceError = "kill_switch" | "maintenance" | "quota" | null;

export function ChatInterface({
  userName = "Guest",
  activeChatId,
  isGuest = false,
  onLoginRequest,
  recentChats = [],
  onChatSelect,
  onFirstMessage,
  onChatCreated,
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [availableModels, setAvailableModels] = useState<{ id: string; name: string; provider: string; model_id: string; is_default: boolean }[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const selectedModel = availableModels.find((m) => m.id === selectedModelId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [serviceError, setServiceError] = useState<ServiceError>(null);
  const [quota, setQuota] = useState<{ used: number; limit: number; remaining: number; pct: number } | null>(null);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  // Inline edit state
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editImage, setEditImage] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  function formatChatDate(date: string) {
    const now = new Date();
    const created = new Date(date);
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays < 1) return "Today";
    if (diffDays < 2) return "Yesterday";
    if (diffDays < 7) return "This week";
    return created.toLocaleDateString();
  }

  useEffect(() => {
    if (!activeChatId || isGuest) {
      setMessages([]);
      return;
    }

    async function loadHistory() {
      try {
        const data = await getChatHistory(activeChatId);
        setMessages(data.map((m: any) => ({ id: m.id, role: m.role, content: m.content, image_url: m.image_url })));
      } catch {
        console.error("History load failed");
      }
    }

    loadHistory();
  }, [activeChatId, isGuest]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch available models
  useEffect(() => {
    if (isGuest) return;
    getChatModels().then((data) => {
      if (data?.length) {
        setAvailableModels(data);
        const def = data.find((m: any) => m.is_default) ?? data[0];
        setSelectedModelId(def.id);
      }
    }).catch(() => {});
  }, [isGuest]);

  // Fetch quota for logged-in users
  useEffect(() => {
    if (isGuest) return;
    getQuotaUsage().then((data) => { if (data) setQuota(data); }).catch(() => {});
  }, [isGuest]);

  const handleDeleteMessage = async (msg: Message) => {
    try {
      await deleteMessage(msg.id);
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === msg.id);
        return idx === -1 ? prev : prev.slice(0, idx);
      });
    } catch {
      toast({ title: "Delete failed", description: "Could not delete message.", variant: "destructive" });
    }
  };

  // Open inline edit mode — purely local, no API call yet
  const handleStartEdit = (msg: Message) => {
    setEditingMsgId(msg.id);
    setEditText(msg.content);
    setEditImage(msg.image_url ?? null);
    setHoveredMsgId(null);
  };

  const handleCancelEdit = () => {
    setEditingMsgId(null);
    setEditText("");
    setEditImage(null);
  };

  // Submit the inline edit: rewind DB then re-stream
  const handleSubmitEdit = async (msg: Message) => {
    const trimmed = editText.trim();
    if (!trimmed) return;

    try {
      // 1. Delete from DB (rewind)
      await rewindMessage(msg.id);

      // 2. Cut UI at that point
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === msg.id);
        return idx === -1 ? prev : prev.slice(0, idx);
      });
      setEditingMsgId(null);

      // 3. Optimistically add new user message
      const userMsg: Message = { id: `msg-${Date.now()}`, role: "user", content: trimmed, image_url: editImage };
      const aiId = `msg-${Date.now()}-ai`;
      setMessages((prev) => [...prev, userMsg, { id: aiId, role: "assistant", content: "" }]);
      setEditText("");
      setEditImage(null);

      // 4. Stream AI reply
      await streamChat(
        trimmed,
        activeChatId ?? null,
        (chunk) => {
          setMessages((prev) => prev.map((m) => m.id === aiId ? { ...m, content: m.content + chunk } : m));
        },
        (meta) => {
          if (!activeChatId && meta.conversationId) onChatCreated?.(meta.conversationId);
        },
        undefined,
        selectedModelId ?? undefined,
        editImage ?? undefined,
      );
      refreshQuota();
    } catch (err: any) {
      toast({ title: "Something went wrong", description: "Failed to submit edit.", variant: "destructive" });
      handleCancelEdit();
    }
  };

  // Refresh quota after each message sent
  const refreshQuota = () => {
    if (isGuest) return;
    getQuotaUsage().then((data) => { if (data) setQuota(data); }).catch(() => {});
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    setServiceError(null);

    if (messages.length === 0) {
      onFirstMessage?.(trimmed);
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: trimmed,
      image_url: attachedImage,
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessage("");

    const aiId = `msg-${Date.now()}-ai`;
    setMessages((prev) => [...prev, { id: aiId, role: "assistant", content: "" }]);

    try {
      await streamChat(
        trimmed,
        activeChatId ?? null,
        (chunk) => {
          setMessages((prev) =>
            prev.map((m) => m.id === aiId ? { ...m, content: m.content + chunk } : m)
          );
        },
        (meta) => {
          if (!activeChatId && meta.conversationId) {
            onChatCreated?.(meta.conversationId);
          }
        },
        undefined,
        selectedModelId ?? undefined,
        attachedImage ?? undefined
      );
      setAttachedImage(null);
      refreshQuota();
    } catch (err: any) {
      const msg = err?.message?.toLowerCase() ?? "";

      // Remove empty AI placeholder
      setMessages((prev) => prev.filter((m) => m.id !== aiId));
      // Remove user message too so they can retry
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      // Restore input
      setMessage(trimmed);

      if (msg.includes("temporarily disabled") || msg.includes("forbidden")) {
        setServiceError("kill_switch");
      } else if (msg.includes("maintenance")) {
        setServiceError("maintenance");
      } else if (msg.includes("limit exceeded") || msg.includes("too many") || msg.includes("429")) {
        setServiceError("quota");
      } else {
        toast({
          title: "Something went wrong",
          description: "Failed to get a response. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      setIsRecording(false);
      toast({ title: "Recording Stopped", description: "Voice added to chat." });
      setMessage((prev) => prev + (prev ? " " : "") + "(Voice Message)");
    } else {
      setIsRecording(true);
      toast({ title: "Recording Started", description: "Listening..." });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid File", description: "Please upload an image.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedImage(event.target?.result as string);
        toast({ title: "Image Attached", description: `${file.name} ready to send.` });
      };
      reader.readAsDataURL(file);
    }
  };

  const hasMessages = messages.length > 0;
  const displayName = isGuest ? "Guest" : userName;
  const lastThreeChats = recentChats.slice(0, 3);

  const guestCards = [
    { title: "Ask Anything", description: "Get instant answers to your questions" },
    { title: "Summarize Text", description: "Paste any text and let AI summarize it" },
    { title: "Write Code", description: "Ask LyraAI to help you write or debug code" },
  ];

  // Service error banner
  const ServiceErrorBanner = () => {
    if (!serviceError) return null;

    const config = {
      kill_switch: {
        icon: PowerOff,
        title: "Chat is temporarily unavailable",
        description: "The AI chat feature has been temporarily disabled by the administrator. Please check back later.",
        color: "border-destructive/30 bg-destructive/5",
        iconColor: "text-destructive",
      },
      maintenance: {
        icon: Wrench,
        title: "System under maintenance",
        description: "We're currently performing maintenance. The service will be back shortly.",
        color: "border-warning/30 bg-warning/5",
        iconColor: "text-warning",
      },
      quota: {
        icon: Zap,
        title: "Daily token limit reached",
        description: "You've used all your tokens for today. Your quota resets at midnight UTC.",
        color: "border-orange-500/30 bg-orange-500/5",
        iconColor: "text-orange-500",
      },
    }[serviceError];

    const Icon = config.icon;

    return (
      <div className={`mx-auto max-w-3xl mb-4 rounded-2xl border px-5 py-4 flex items-start gap-4 ${config.color}`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background border border-border">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{config.title}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{config.description}</p>
        </div>
      </div>
    );
  };

  // Quota bar — shown below input for logged-in users
  const QuotaBar = () => {
    if (isGuest || !quota) return null;
    const isWarning = quota.pct >= 80;
    const isCritical = quota.pct >= 95;
    return (
      <div className="mt-2 px-1">
        <div className="flex items-center justify-between mb-1">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Zap className="h-3 w-3" />
            {quota.used.toLocaleString()} / {quota.limit.toLocaleString()} tokens today
          </span>
          <span className={cn(
            "text-[11px] font-medium",
            isCritical ? "text-destructive" : isWarning ? "text-warning" : "text-muted-foreground"
          )}>
            {quota.remaining.toLocaleString()} remaining · resets midnight UTC
          </span>
        </div>
        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isCritical ? "bg-destructive" : isWarning ? "bg-warning" : "bg-primary"
            )}
            style={{ width: `${quota.pct}%` }}
          />
        </div>
        {isCritical && (
          <p className="mt-1 text-[11px] text-destructive">
            You've almost reached your daily limit. Resets at midnight UTC.
          </p>
        )}
      </div>
    );
  };

  const inputArea = (
    <div className="rounded-2xl border border-border bg-background shadow-sm px-4 pt-3 pb-3">
      {attachedImage && (
        <div className="mb-2 relative inline-block">
          <img src={attachedImage} alt="Attachment preview" className="h-16 w-16 object-cover rounded-md border border-border" />
          <button
            onClick={() => setAttachedImage(null)}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 h-5 w-5 flex items-center justify-center text-xs"
          >
            ×
          </button>
        </div>
      )}
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask me anything..."
        rows={2}
        className="min-h-[44px] w-full resize-none border-0 bg-transparent p-0 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none shadow-none"
      />
      <div className="mt-2 flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground text-sm h-8 px-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">
                {selectedModel ? selectedModel.name : "Select model"}
              </span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {availableModels.map((m) => (
              <DropdownMenuItem key={m.id} onClick={() => setSelectedModelId(m.id)}>
                <span>{m.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">{m.provider}</span>
              </DropdownMenuItem>
            ))}
            {availableModels.length === 0 && (
              <DropdownMenuItem disabled>No models available</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost" size="icon"
            className={`h-8 w-8 ${isRecording ? "text-red-500 animate-pulse" : "text-muted-foreground"}`}
            onClick={handleMicClick}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            className="h-8 w-8 rounded-xl bg-primary hover:bg-primary/90 text-white"
            onClick={handleSend}
            disabled={!message.trim()}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const quickActions = (
    <div className="mt-3 flex items-center gap-2">
      <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      <Button
        variant="ghost" size="sm"
        className="gap-2 text-sm rounded-full text-muted-foreground hover:text-foreground hover:bg-muted h-8 px-3"
        onClick={() => fileInputRef.current?.click()}
      >
        <Paperclip className="h-4 w-4" />
        <span className="hidden sm:inline">Add Attachment</span>
      </Button>
      <Button
        variant="ghost" size="sm"
        className="gap-2 text-sm rounded-full text-muted-foreground hover:text-foreground hover:bg-muted h-8 px-3"
        onClick={() => toast({ title: "Tool Settings", description: "Opening tool configurations..." })}
      >
        <Settings2 className="h-4 w-4" />
        <span className="hidden sm:inline">Tool Settings</span>
      </Button>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      {!hasMessages ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 md:px-6 w-full max-w-3xl mx-auto mb-16">
          <div className="flex flex-col items-center w-full mb-32 -mt-12">
            <Image
              src="/chatL.png" alt="LyraAI" width={200} height={200}
              className="h-20 w-20 md:h-36 md:w-36 object-contain logo-animated mb-2"
              priority
            />
            <h1 className="text-[26px] md:text-[30px] font-semibold text-primary tracking-tight">
              Hello, {displayName}
            </h1>
            <p className="text-[24px] md:text-[28px] text-foreground/80 text-center font-medium tracking-tight">
              What can I help you with today?
            </p>
            {isGuest && (
              <p className="mt-3 text-sm text-muted-foreground bg-muted/50 px-4 py-1.5 rounded-full border border-border">
                <button onClick={onLoginRequest} className="text-primary hover:underline font-medium">
                  Login
                </button>{" "}
                to save your conversation history
              </p>
            )}
          </div>

          <div className="w-full">
            <ServiceErrorBanner />
            {inputArea}
            {quickActions}
            <QuotaBar />

            {!isGuest && lastThreeChats.length > 0 && (
              <div className="mt-8 hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-4">
                {lastThreeChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => onChatSelect?.(chat.id)}
                    className="group relative rounded-2xl border border-border bg-muted/30 p-4 hover:bg-muted/50 transition-all duration-200 hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">{chat.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground capitalize">{formatChatDate(chat.created_at)}</p>
                  </div>
                ))}
              </div>
            )}

            {isGuest && (
              <div className="mt-8 hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-4">
                {guestCards.map((card, i) => (
                  <div
                    key={i} onClick={onLoginRequest}
                    className="group rounded-2xl border border-border bg-muted/30 p-4 hover:bg-muted/50 transition-all duration-200 hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{card.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{card.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map((msg) => {
                const isEditing = editingMsgId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} group relative`}
                    onMouseEnter={() => !isEditing && setHoveredMsgId(msg.id)}
                    onMouseLeave={() => setHoveredMsgId(null)}
                  >
                    {/* === INLINE EDIT MODE === */}
                    {isEditing && msg.role === "user" ? (
                      <div className="w-full max-w-[85%] md:max-w-[75%]">
                        <div className="rounded-2xl border border-primary/40 bg-primary/5 px-4 pt-3 pb-3 shadow-sm">
                          {/* Image preview in edit mode */}
                          {editImage && (
                            <div className="mb-2 relative inline-block">
                              <img src={editImage} alt="Attachment" className="h-20 w-20 object-cover rounded-lg border border-border" />
                              <button
                                onClick={() => setEditImage(null)}
                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shadow"
                              >
                                ×
                              </button>
                            </div>
                          )}
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmitEdit(msg); }
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                            rows={Math.max(2, editText.split("\n").length)}
                            autoFocus
                            className="w-full resize-none border-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 leading-relaxed"
                          />
                          <div className="mt-2 flex items-center justify-between">
                            {/* Add/replace image in edit mode */}
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={editFileInputRef}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = (ev) => setEditImage(ev.target?.result as string);
                                  reader.readAsDataURL(file);
                                  e.target.value = "";
                                }}
                              />
                              <button
                                onClick={() => editFileInputRef.current?.click()}
                                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
                              >
                                <Paperclip className="h-3.5 w-3.5" />
                                {editImage ? "Replace image" : "Add image"}
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleCancelEdit}
                                className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSubmitEdit(msg)}
                                disabled={!editText.trim()}
                                className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                                Send
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Action buttons — shown on hover for user messages */}
                        {msg.role === "user" && !isGuest && hoveredMsgId === msg.id && (
                          <div className="flex items-center gap-1.5 mr-2 self-end mb-1">
                            <button
                              onClick={() => handleStartEdit(msg)}
                              title="Edit"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground bg-muted hover:bg-muted/80 hover:text-foreground transition-all"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg)}
                              title="Delete"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground bg-muted hover:bg-destructive/15 hover:text-destructive transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        )}
                        {/* Normal message bubble */}
                        <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        }`}>
                          {msg.image_url && (
                            <img src={msg.image_url} alt="Attachment" className="max-w-full rounded-md mb-2 object-contain" style={{ maxHeight: "200px" }} />
                          )}
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                              components={{
                                h1: ({ children }) => <h1 className="text-lg font-semibold mt-4">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-base font-semibold mt-3">{children}</h2>,
                                ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
                                table: ({ children }) => <table className="w-full border-collapse border border-border my-3 text-sm">{children}</table>,
                                thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
                                th: ({ children }) => <th className="border border-border px-3 py-2 text-left font-medium">{children}</th>,
                                td: ({ children }) => <td className="border border-border px-3 py-2">{children}</td>,
                                code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-sm">{children}</code>,
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          </div>
          <div className="px-4 md:px-6 py-3 md:py-4">
            <div className="mx-auto max-w-3xl">
              <ServiceErrorBanner />
              {inputArea}
              {quickActions}
              <QuotaBar />
            </div>
          </div>
        </>
      )}
    </div>
  );
}