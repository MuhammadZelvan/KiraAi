"use client";

import { Search, Bell, Share2, Plus, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface UserHeaderProps {
  currentPage: string;
  onNewChat: () => void;
  isLoggedIn?: boolean;
}

export function UserHeader({ currentPage, onNewChat, isLoggedIn = true }: UserHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        <span className="font-medium text-foreground">{currentPage}</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="h-9 w-48 rounded-lg border-border bg-background pl-9 pr-12 text-sm placeholder:text-muted-foreground"
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-muted px-1 py-0.5">
            <Command className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>

        {/* Notification */}
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Bell className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* Share */}
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Share2 className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* New Chat or Login */}
        {isLoggedIn ? (
          <Button onClick={onNewChat} className="gap-2">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        ) : (
          <Button onClick={() => router.push("/login")} className="gap-2">
            Login
          </Button>
        )}
      </div>
    </header>
  );
}
