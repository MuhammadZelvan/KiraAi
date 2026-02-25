import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Email } from "@/app/email/page";

interface EmailListProps {
  emails: Email[];
  selectedEmail: Email;
  onSelectEmail: (email: Email) => void;
  filter: "all" | "read" | "unread";
  onFilterChange: (filter: "all" | "read" | "unread") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function EmailList({
  emails,
  selectedEmail,
  onSelectEmail,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: EmailListProps) {
  return (
    <div className="flex w-80 flex-col border-r border-border bg-background">
      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-muted/50 border-0"
          />
        </div>
      </div>

      {/* Filter Tabs */}
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

      {/* Email List */}
      <ScrollArea className="flex-1">
        <div className="space-y-0.5">
          {emails.map((email) => (
            <button
              key={email.id}
              onClick={() => onSelectEmail(email)}
              className={cn(
                "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50",
                selectedEmail.id === email.id && "bg-muted",
                !email.read && "bg-primary/5 border-l-2 border-l-primary"
              )}
              style={{ maxWidth: '320px' }}
            >

              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={email.avatar} alt={email.sender} />
                <AvatarFallback>
                  {email.sender
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              {/* Text Container */}
              <div className="flex-1 min-w-0 overflow-hidden">
                {/* Sender and Time Row */}
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span
                    className={cn(
                      "text-sm truncate block flex-1",
                      !email.read ? "font-bold text-foreground" : "font-medium text-foreground"
                    )}
                  >
                    {email.sender}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                    {email.time}
                  </span>
                </div>

                {/* Subject */}
                <div className="w-full overflow-hidden">
                  <p
                    className={cn(
                      "text-sm mb-0.5 truncate",
                      !email.read ? "font-semibold text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {email.subject}
                  </p>
                </div>

                {/* Preview */}
                <div className="w-full overflow-hidden">
                  <p className="text-xs text-muted-foreground truncate">
                    {email.preview}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
