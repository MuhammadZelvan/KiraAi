"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Mic,
  ArrowUp,
  Paperclip,
  Settings2,
  Globe,
  ChevronDown,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { sendChat } from "@/lib/api";
import { getChatHistory } from "@/lib/api";
import { streamChat } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
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

const models = ["Grock 4.1", "GPT 3.5", "Gemini 3"];

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
  const [selectedModel, setSelectedModel] = useState("Grock 4.1");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const conversationId = activeChatId ?? null;

  function formatChatDate(date: string) {
    const now = new Date();
    const created = new Date(date);

    const diffDays =
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

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

        const formatted = data.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        }));

        setMessages(formatted);
      } catch {
        console.error("History load failed");
      }
    }

    loadHistory();
  }, [activeChatId, isGuest]);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    if (messages.length === 0) {
      onFirstMessage?.(trimmed);
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessage("");

    // Buat placeholder AI message kosong
    const aiId = `msg-${Date.now()}-ai`;

    setMessages((prev) => [
      ...prev,
      { id: aiId, role: "assistant", content: "" },
    ]);

    try {
      await streamChat(
        trimmed,
        activeChatId ?? null,
        (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId ? { ...m, content: m.content + chunk } : m,
            ),
          );
        },
        (meta) => {
          if (!activeChatId && meta.conversationId) {
            onChatCreated?.(meta.conversationId);
          }
        },
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiId
            ? { ...m, content: "Terjadi kesalahan saat streaming AI." }
            : m,
        ),
      );
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
      toast({
        title: "Recording Stopped",
        description: "Voice added to chat.",
      });
      setMessage((prev) => prev + (prev ? " " : "") + "(Voice Message)");
    } else {
      setIsRecording(true);
      toast({ title: "Recording Started", description: "Listening..." });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file)
      toast({
        title: "File Attached",
        description: `${file.name} ready to send.`,
      });
  };

  const handleToolSettings = () => {
    toast({
      title: "Tool Settings",
      description: "Opening tool configurations...",
    });
  };

  const hasMessages = messages.length > 0;
  const displayName = isGuest ? "Guest" : userName;
  const lastThreeChats = recentChats.slice(0, 3);

  const guestCards = [
    {
      title: "Ask Anything",
      description: "Get instant answers to your questions",
    },
    {
      title: "Summarize Text",
      description: "Paste any text and let AI summarize it",
    },
    {
      title: "Write Code",
      description: "Ask LyraAI to help you write or debug code",
    },
  ];

  // Shared input area — inline JSX to prevent re-mount on each keystroke
  const inputArea = (
    <div className="rounded-2xl border border-border bg-background shadow-sm px-4 pt-3 pb-3">
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
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground text-sm h-8 px-2"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{selectedModel}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {models.map((m) => (
              <DropdownMenuItem key={m} onClick={() => setSelectedModel(m)}>
                {m}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
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
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-sm rounded-full text-muted-foreground hover:text-foreground hover:bg-muted h-8 px-3"
        onClick={() => fileInputRef.current?.click()}
      >
        <Paperclip className="h-4 w-4" />
        <span className="hidden sm:inline">Add Attachment</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-sm rounded-full text-muted-foreground hover:text-foreground hover:bg-muted h-8 px-3"
        onClick={handleToolSettings}
      >
        <Settings2 className="h-4 w-4" />
        <span className="hidden sm:inline">Tool Settings</span>
      </Button>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      {!hasMessages ? (
        /* ─── Welcome screen ─── */
        <div className="flex flex-1 flex-col items-center justify-center px-4 md:px-6 w-full max-w-3xl mx-auto mb-16">
          <div className="flex flex-col items-center w-full mb-32 -mt-12">
            <Image
              src="/chatL.png"
              alt="LyraAI"
              width={200}
              height={200}
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
                <button
                  onClick={onLoginRequest}
                  className="text-primary hover:underline font-medium"
                >
                  Login
                </button>{" "}
                to save your conversation history
              </p>
            )}
          </div>

          <div className="w-full">
            {inputArea}
            {quickActions}

            {/* Recent chat cards — logged in only */}
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
                    <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                      {chat.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground capitalize">
                      {formatChatDate(chat.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Guest suggestion cards */}
            {isGuest && (
              <div className="mt-8 hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-4">
                {guestCards.map((card, i) => (
                  <div
                    key={i}
                    onClick={onLoginRequest}
                    className="group rounded-2xl border border-border bg-muted/30 p-4 hover:bg-muted/50 transition-all duration-200 hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {card.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ─── Active chat ─── */
        <>
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-lg font-semibold mt-4">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-base font-semibold mt-3">
                              {children}
                            </h2>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-5 space-y-1">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-5 space-y-1">
                              {children}
                            </ol>
                          ),
                          code: ({ children }) => (
                            <code className="bg-muted px-1 py-0.5 rounded text-sm">
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </div>
          <div className="px-4 md:px-6 py-3 md:py-4">
            <div className="mx-auto max-w-3xl">
              {inputArea}
              {quickActions}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
