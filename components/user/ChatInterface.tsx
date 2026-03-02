"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Mic, ArrowUp, Paperclip, Settings2, Globe,
  ChevronDown, MessageCircle, MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface RecentChat {
  id: string;
  title: string;
  date: "today" | "yesterday";
}

interface ChatInterfaceProps {
  userName?: string;
  activeChatId?: string | null;
  isGuest?: boolean;
  onLoginRequest?: () => void;
  recentChats?: RecentChat[];
  onChatSelect?: (id: string) => void;
}

const models = ["GPT 3.5", "GPT 4", "GPT 4 Turbo", "Claude 3"];

export function ChatInterface({
  userName = "Guest",
  activeChatId,
  isGuest = false,
  onLoginRequest,
  recentChats = [],
  onChatSelect,
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("GPT 3.5");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = () => {
    if (message.trim()) {
      const userMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: message.trim(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-ai`,
            role: "assistant",
            content: "This is a dummy AI response. The backend is not connected yet.",
          },
        ]);
      }, 500);
      setMessage("");
    }
  };

  const hasMessages = messages.length > 0 || activeChatId;
  const displayName = isGuest ? "Guest" : userName;
  const lastThreeChats = recentChats.slice(0, 3);

  // Placeholder cards
  const guestCards = [
    { title: "New Chat", description: "Start a fresh conversation with LyraAI" },
    { title: "New Chat", description: "Explore AI capabilities and features" },
    { title: "New Chat", description: "Ask me anything you'd like to know" },
  ];

  const InputSection = () => (
    <div className="rounded-xl border border-border bg-card p-3 md:p-4 shadow-sm">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask me anything..."
        className="min-h-[50px] md:min-h-[60px] resize-none border-0 bg-transparent p-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <div className="mt-3 flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 md:gap-2 text-muted-foreground text-xs md:text-sm"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{selectedModel}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {models.map((model) => (
              <DropdownMenuItem key={model} onClick={() => setSelectedModel(model)}>
                {model}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Mic className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleSend}
            disabled={!message.trim()}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const QuickActions = () => (
    <div className="mt-3 flex items-center gap-2">
      <Button variant="outline" size="sm" className="gap-2 text-xs md:text-sm rounded-full">
        <Paperclip className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Add Attachment</span>
        <span className="sm:hidden">Attach</span>
      </Button>
      <Button variant="outline" size="sm" className="gap-2 text-xs md:text-sm rounded-full">
        <Settings2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Tool Settings</span>
        <span className="sm:hidden">Tools</span>
      </Button>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      {!hasMessages ? (
        <>
          {/* Welcome Section */}
          <div className="flex flex-1 flex-col items-center justify-center px-4 md:px-6 pb-4">
            <div className="mb-5 md:mb-6">
              <Image
                src="/chatL.png"
                alt="LyraAI"
                width={120}
                height={120}
                className="h-24 w-24 md:h-28 md:w-28 object-contain drop-shadow-xl"
                priority
              />
            </div>
            <h1 className="mb-1 text-2xl md:text-3xl font-bold text-primary">
              Hello, {displayName}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-center font-medium">
              What can I help you with today?
            </p>
            {isGuest && (
              <p className="mt-3 text-sm text-muted-foreground">
                <button
                  onClick={onLoginRequest}
                  className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity font-medium"
                >
                  Login
                </button>{" "}
                to save your conversation history
              </p>
            )}
          </div>

          {/* Input area + Suggestion Cards */}
          <div className="px-4 md:px-6 pb-6 md:pb-10">
            <div className="mx-auto max-w-3xl">
              <InputSection />
              <QuickActions />

              {/* History cards (logged in) */}
              {!isGuest && lastThreeChats.length > 0 && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {lastThreeChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => onChatSelect?.(chat.id)}
                      className="group relative rounded-2xl border border-border bg-card p-5 shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 cursor-pointer"
                    >
                      {/* Top row: icon + more button */}
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                          <MessageCircle className="h-5 w-5 text-primary" />
                        </div>
                        {/* Use div instead of button to avoid nested button error */}
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.key === "Enter" && e.stopPropagation()}
                          className="flex h-7 w-7 items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted cursor-pointer"
                        >
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                        {chat.title}
                      </p>
                      <p className="mt-1.5 text-xs text-muted-foreground capitalize">
                        {chat.date === "today" ? "Today" : "Yesterday"}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Guest placeholder cards */}
              {isGuest && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {guestCards.map((card, i) => (
                    <div
                      key={i}
                      onClick={onLoginRequest}
                      className="group rounded-2xl border border-border bg-card p-5 shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 cursor-pointer"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                          <MessageCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex h-7 w-7 items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted cursor-pointer">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{card.title}</p>
                      <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{card.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Active Chat */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
            <div className="mx-auto max-w-3xl space-y-4 md:space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                      }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-border px-4 md:px-6 py-3 md:py-4">
            <div className="mx-auto max-w-3xl">
              <InputSection />
              <QuickActions />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
