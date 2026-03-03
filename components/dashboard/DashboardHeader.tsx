"use client";

import { useState, useEffect } from "react";
import { Search, HelpCircle, ChevronRight, Command } from "lucide-react";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationPopover } from "./NotificationPopover";
import { CommandMenu } from "./CommandMenu";
import { ProfilePopover } from "./ProfilePopover";

const routeNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/email": "Email & Message",
  "/analytics": "Analytics",
  "/users": "User Manage",
  "/api-keys": "API Keys",
  "/tokenizer": "Tokenizer",
  "/system": "System Control",
  "/system-control": "System Control",
  "/settings": "Settings",
  "/help": "Help Support",
};

export function DashboardHeader() {
  const pathname = usePathname();
  const currentRoute = routeNames[pathname] || "Dashboard";
  const [commandOpen, setCommandOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut for command menu (Cmd+K or Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-8 w-8" />
          <nav className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Main Menu</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{currentRoute}</span>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Button - Opens Command Menu */}
          <button
            onClick={() => setCommandOpen(true)}
            className="relative flex h-10 w-64 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
            <div className="ml-auto flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5">
              <Command className="h-3 w-3" />
              <span className="text-xs">K</span>
            </div>
          </button>

          <ThemeToggle />

          {/* Notification Popover - Only render when mounted */}
          {mounted ? (
            <NotificationPopover />
          ) : (
            // Placeholder button to prevent layout shift
            <button className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground bg-muted/50">
              <div className="h-5 w-5 bg-current opacity-20" />
            </button>
          )}

          <Link
            href="/help"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HelpCircle className="h-5 w-5" />
          </Link>

          {/* Profile Popover */}
          {mounted ? (
            <ProfilePopover />
          ) : (
            <div className="h-10 w-10 rounded-full bg-muted/50" />
          )}
        </div>
      </header>

      {/* Command Menu Dialog - Only render when mounted */}
      {mounted && <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />}
    </>
  );
}

