"use client";

import { useState } from "react";
import { Search, Archive, Share2, LogIn, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UserHeaderProps {
  currentPage: string;
  onNewChat: () => void;
  isLoggedIn?: boolean;
  onLoginRequest?: () => void;
}

export function UserHeader({
  currentPage,
  isLoggedIn = false,
  onLoginRequest,
}: UserHeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:px-6 shrink-0">
      {/* Left: page title */}
      <div className="flex items-center pl-10 md:pl-0">
        <span className="font-medium text-foreground">{currentPage}</span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Search bar — hidden on small mobile */}
        <div className={`relative hidden sm:flex items-center transition-all duration-200 ${searchFocused ? "w-52" : "w-44"}`}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search"
            className="h-9 w-full rounded-lg border-border bg-background pl-9 pr-10 text-sm placeholder:text-muted-foreground focus-visible:ring-1"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded border border-border bg-muted px-1 py-0.5 pointer-events-none">
            <Command className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>

        {/* Mobile search icon only */}
        <Button variant="ghost" size="icon" className="h-9 w-9 sm:hidden">
          <Search className="h-4 w-4 text-muted-foreground" />
        </Button>


        {/* Archive */}
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Archive className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* Share */}
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Share2 className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* Login button — always visible for guests */}
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
