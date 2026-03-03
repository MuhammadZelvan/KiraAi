"use client";

import { useState } from "react";
import { Search, Archive, Share2, LogIn, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface UserHeaderProps {
  currentPage: string;
  onNewChat: () => void;
  isLoggedIn?: boolean;
  onLoginRequest?: () => void;
  activeChatId?: string | null;
  onShare?: (id: string) => string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
}

export function UserHeader({
  currentPage,
  isLoggedIn = false,
  onLoginRequest,
  activeChatId,
  onShare,
  searchValue = "",
  onSearchChange,
}: UserHeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = () => {
    if (!activeChatId || !onShare) {
      toast({ title: "No active chat", description: "Start a conversation first to share it." });
      return;
    }
    const url = onShare(activeChatId);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast({ title: "Link copied!", description: "Share link has been copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <header className="flex h-14 items-center justify-end bg-background px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-1 md:gap-2">
        {/* Search — filters chat history */}
        <div className={`relative hidden sm:flex items-center transition-all duration-200 ${searchFocused ? "w-60" : "w-48"}`}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search chats..."
            className="h-9 w-full rounded-lg border-border bg-muted/40 pl-9 text-sm placeholder:text-muted-foreground focus-visible:ring-1"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchValue && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => onSearchChange?.("")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Mobile search icon */}
        <Button variant="ghost" size="icon" className="h-9 w-9 sm:hidden">
          <Search className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* Archive (visual only — archiving is done from sidebar) */}
        <Button
          variant="ghost" size="icon"
          className="h-9 w-9"
          title="Archive — hover a chat in sidebar and click ••• to archive"
        >
          <Archive className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* Share current chat */}
        <Button
          variant="ghost" size="icon"
          className="h-9 w-9"
          title="Share this conversation"
          onClick={handleShare}
        >
          {copied
            ? <Check className="h-4 w-4 text-green-500" />
            : <Share2 className="h-4 w-4 text-muted-foreground" />}
        </Button>

        {/* Login */}
        {!isLoggedIn && (
          <Button
            variant="outline"
            size="sm"
            onClick={onLoginRequest}
            className="gap-1.5 ml-1"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">Login</span>
          </Button>
        )}
      </div>
    </header>
  );
}
