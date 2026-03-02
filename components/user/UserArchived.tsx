"use client";

import { useState } from "react";
import { Search, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewMode = "kanban" | "list";

interface UserArchivedProps {
    isLoggedIn?: boolean;
    onLoginRequest?: () => void;
}

export function UserArchived({ isLoggedIn = false, onLoginRequest }: UserArchivedProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("kanban");
    const [search, setSearch] = useState("");

    // For now, archived is always empty (no backend yet)
    const isEmpty = true;

    return (
        <div className="flex h-full flex-col">
            {/* Page header */}
            <div className="border-b border-border bg-card px-6 py-4 shrink-0">
                <h1 className="text-xl font-semibold text-foreground">Archived</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    {isLoggedIn
                        ? "Here's a quick overview of your archived conversations!"
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
                                viewMode === "kanban" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <LayoutGrid className="h-4 w-4" />
                            Kanban
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                                viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
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
                            placeholder="Search Archived"
                            className="pl-9 h-9 rounded-lg"
                        />
                    </div>

                    {/* Sort */}
                    <Button variant="outline" size="sm" className="gap-2 h-9">
                        <SlidersHorizontal className="h-4 w-4" />
                        Sort by
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-background">
                {isEmpty ? (
                    /* Empty state */
                    <div className="flex h-full flex-col items-center justify-center gap-5 px-4">
                        <div className="relative">
                            <Image
                                src="/archieved.png"
                                alt="No archived data"
                                width={220}
                                height={220}
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="text-center space-y-1.5">
                            <h3 className="text-lg font-semibold text-foreground">No Archived Data</h3>
                            <p className="text-sm text-muted-foreground max-w-xs">
                                {isLoggedIn
                                    ? "Archived conversations, files, and records will be displayed here for future reference."
                                    : "Login to access and manage your archived conversations."}
                            </p>
                        </div>
                        {!isLoggedIn && (
                            <Button onClick={onLoginRequest} className="px-6">
                                Sign in to view archives
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="p-6">
                        {/* Future: render archived items here */}
                        <p className="text-sm text-muted-foreground">Archived items will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
