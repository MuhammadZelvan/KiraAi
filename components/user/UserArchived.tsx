"use client";

import { useState, useMemo } from "react";
import {
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ArchiveRestore,
  Trash2,
  MessageCircle,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Chat } from "@/app/user/page";

type ViewMode = "kanban" | "list";
type SortOption = "newest" | "oldest" | "az" | "za";

interface UserArchivedProps {
  isLoggedIn?: boolean;
  onLoginRequest?: () => void;
  archivedChats?: Chat[];
  onUnarchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onChatSelect?: (id: string) => void; // ← tambah ini
}

export function UserArchived({
  isLoggedIn = false,
  onLoginRequest,
  archivedChats = [],
  onUnarchive,
  onDelete,
  onChatSelect,
}: UserArchivedProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const filtered = useMemo(() => {
    let items = [...archivedChats];

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((c) => (c.title ?? "").toLowerCase().includes(q));
    }

    switch (sortBy) {
      case "newest":
        items = [...items].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;

      case "oldest":
        items = [...items].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        break;

      case "az":
        items = [...items].sort((a, b) =>
          (a.title ?? "").localeCompare(b.title ?? ""),
        );
        break;

      case "za":
        items = [...items].sort((a, b) =>
          (b.title ?? "").localeCompare(a.title ?? ""),
        );
        break;
    }

    return items;
  }, [archivedChats, search, sortBy]);

  const isEmpty = filtered.length === 0;

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="bg-background px-6 py-4 shrink-0">
        <h1 className="text-xl font-semibold text-foreground">Archived</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isLoggedIn
            ? "Your archived conversations are stored here."
            : "Login to view your archived conversations"}
        </p>

        {/* Toolbar */}
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-border bg-background p-0.5 gap-0.5">
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                viewMode === "kanban"
                  ? "bg-muted text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                viewMode === "list"
                  ? "bg-muted text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <List className="h-4 w-4" />
              List
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search archived..."
              className="pl-9 h-9 rounded-lg"
            />
          </div>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-9">
                <SlidersHorizontal className="h-4 w-4" />
                Sort by
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("newest")}>
                Newest first
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                Oldest first
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("az")}>
                A → Z
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("za")}>
                Z → A
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-background px-6">
        {!isLoggedIn ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <p className="text-muted-foreground text-sm">
              You need to be logged in to view archives.
            </p>
            <Button onClick={onLoginRequest}>Sign in</Button>
          </div>
        ) : isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <Image
              src="/archieved.png"
              alt="No archived conversations"
              width={200}
              height={200}
              className="object-contain opacity-70"
              priority
            />
            <div>
              <h3 className="text-base font-semibold text-foreground">
                No Archived Conversations
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                {search.trim()
                  ? "No results match your search."
                  : "Hover over a chat in the sidebar and click ••• to archive it."}
              </p>
            </div>
          </div>
        ) : viewMode === "kanban" ? (
          /* ── Kanban grid ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {filtered.map((chat) => (
              <div
                key={chat.id}
                className="group rounded-2xl border border-border bg-muted/30 p-4 hover:bg-muted/50 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <MessageCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      title="Unarchive"
                      onClick={() => onUnarchive?.(chat.id)}
                    >
                      <ArchiveRestore className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      title="Delete"
                      onClick={() => onDelete?.(chat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground line-clamp-2">
                  {chat.title}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    {new Date(chat.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── List view ── */
          <div className="py-4 space-y-2">
            {filtered.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onChatSelect?.(chat.id)}
                className="group cursor-pointer rounded-2xl border border-border bg-muted/30 p-4 hover:bg-muted/50 transition-all duration-200"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <MessageCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {chat.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(chat.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => onUnarchive?.(chat.id)}
                  >
                    <ArchiveRestore className="h-3.5 w-3.5" />
                    Unarchive
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete?.(chat.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
