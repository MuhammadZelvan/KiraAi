"use client";

import { Search, Ticket, Mail, Clock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Email } from "@/app/email/page";
import type { SupportTicket } from "@/types/support";

interface EmailListProps {
  emails: Email[];
  selectedEmail: Email | null;
  onSelectEmail: (email: Email) => void;
  filter: "all" | "read" | "unread";
  onFilterChange: (filter: "all" | "read" | "unread") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  // ── Support tickets ──
  activeTab: "email" | "tickets";
  onTabChange: (tab: "email" | "tickets") => void;
  tickets: SupportTicket[];
  selectedTicket: SupportTicket | null;
  onSelectTicket: (ticket: SupportTicket) => void;
  ticketsLoading?: boolean;
}

const priorityConfig = {
  low:    { label: "Low",    color: "text-green-500",  bg: "bg-green-500/10"  },
  medium: { label: "Medium", color: "text-amber-500",  bg: "bg-amber-500/10"  },
  high:   { label: "High",   color: "text-red-500",    bg: "bg-red-500/10"    },
};

const statusConfig = {
  open:        { label: "Open",        icon: AlertCircle,   color: "text-blue-500"  },
  in_progress: { label: "In Progress", icon: Clock,         color: "text-amber-500" },
  resolved:    { label: "Resolved",    icon: CheckCircle2,  color: "text-green-500" },
  closed:      { label: "Closed",      icon: CheckCircle2,  color: "text-muted-foreground" },
};

export function EmailList({
  emails,
  selectedEmail,
  onSelectEmail,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  tickets = [],
  selectedTicket,
  onSelectTicket,
  ticketsLoading,
}: EmailListProps) {
  const unreadCount  = emails.filter((e) => !e.read).length;
  const openTickets  = tickets.filter((t) => t.status === "open").length;

  const filteredTickets = tickets.filter(
    (t) =>
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.user_name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex w-80 flex-col border-r border-border bg-background">

      {/* ── Tab switcher ── */}
      <div className="flex border-b border-border">
        <button
          onClick={() => onTabChange("email")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors",
            activeTab === "email"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Mail className="h-4 w-4" />
          Email
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => onTabChange("tickets")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors",
            activeTab === "tickets"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Ticket className="h-4 w-4" />
          Support
          {openTickets > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {openTickets}
            </span>
          )}
        </button>
      </div>

      {/* ── Search ── */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={activeTab === "email" ? "Search emails..." : "Search tickets..."}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-muted/50 border-0"
          />
        </div>
      </div>

      {/* ── Email tab filters ── */}
      {activeTab === "email" && (
        <div className="flex gap-1 px-4 pb-4">
          {(["all", "read", "unread"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => onFilterChange(tab)}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-medium capitalize transition-colors",
                filter === tab
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {tab === "all" ? "All" : tab === "read" ? "Read" : "Unread"}
            </button>
          ))}
        </div>
      )}

      {/* ── Ticket tab status filter ── */}
      {activeTab === "tickets" && (
        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground">
            {openTickets} open · {tickets.length} total
          </p>
        </div>
      )}

      {/* ── List ── */}
      <ScrollArea className="flex-1">

        {/* Email list */}
        {activeTab === "email" && (
          <div className="space-y-0.5">
            {emails.map((email) => (
              <button
                key={email.id}
                onClick={() => onSelectEmail(email)}
                className={cn(
                  "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50",
                  selectedEmail?.id === email.id && "bg-muted",
                  !email.read && "bg-primary/5 border-l-2 border-l-primary"
                )}
                style={{ maxWidth: "320px" }}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={email.avatar} alt={email.sender} />
                  <AvatarFallback>
                    {email.sender.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className={cn(
                      "text-sm truncate block flex-1",
                      !email.read ? "font-bold text-foreground" : "font-medium text-foreground"
                    )}>
                      {email.sender}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                      {email.time}
                    </span>
                  </div>
                  <p className={cn(
                    "text-sm mb-0.5 truncate",
                    !email.read ? "font-semibold text-foreground" : "text-muted-foreground"
                  )}>
                    {email.subject}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{email.preview}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Ticket list */}
        {activeTab === "tickets" && (
          <div className="space-y-0.5">
            {ticketsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Ticket className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No tickets found</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const status   = statusConfig[ticket.status as keyof typeof statusConfig];
                const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig];
                const StatusIcon = status.icon;
                const initials = (ticket.user_name ?? ticket.user_email)
                  .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

                return (
                  <button
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket)}
                    className={cn(
                      "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50",
                      selectedTicket?.id === ticket.id && "bg-muted",
                      ticket.status === "open" && "border-l-2 border-l-destructive bg-destructive/5"
                    )}
                    style={{ maxWidth: "320px" }}
                  >
                    {/* Avatar */}
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {ticket.user_name ?? ticket.user_email.split("@")[0]}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                          {new Date(ticket.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>

                      <p className="text-sm text-foreground truncate mb-1.5">{ticket.subject}</p>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Status badge */}
                        <span className={cn("flex items-center gap-1 text-[10px] font-medium", status.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>

                        <span className="text-muted-foreground/40 text-xs">·</span>

                        {/* Priority badge */}
                        <span className={cn(
                          "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                          priority.bg, priority.color
                        )}>
                          {priority.label}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}