import { useState } from "react";
import { MessageCircle, Archive, Folder, Settings, HelpCircle, Plus, Trash2, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Chat {
  id: string;
  title: string;
  date: "today" | "yesterday";
}

interface UserSidebarProps {
  activeView: "chat" | "archived" | "library" | "settings" | "help";
  onViewChange: (view: "chat" | "archived" | "library" | "settings" | "help") => void;
  chats: Chat[];
  activeChatId: string | null;
  onChatSelect: (id: string) => void;
  onChatDelete: (id: string) => void;
  onNewChat: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  { id: "chat" as const, label: "Chat", icon: MessageCircle },
  { id: "archived" as const, label: "Archived", icon: Archive },
  { id: "library" as const, label: "Library", icon: Folder },
];

export function UserSidebar({
  activeView,
  onViewChange,
  chats,
  activeChatId,
  onChatSelect,
  onChatDelete,
  onNewChat,
  isCollapsed,
  onToggleCollapse,
}: UserSidebarProps) {
  const todayChats = chats.filter((c) => c.date === "today");
  const yesterdayChats = chats.filter((c) => c.date === "yesterday");

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <span className="text-sm font-bold text-background">K</span>
            </div>
            <span className="font-semibold text-foreground">KiraAI</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8"
        >
          <PanelLeftClose className={cn("h-4 w-4", isCollapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Features Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {!isCollapsed && (
          <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">
            Features
          </p>
        )}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                activeView === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                isCollapsed && "justify-center px-2"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Chat History */}
        {!isCollapsed && activeView === "chat" && (
          <div className="mt-6 space-y-4">
            {todayChats.length > 0 && (
              <div>
                <p className="mb-2 px-2 text-xs font-medium text-primary">Today</p>
                <div className="space-y-1">
                  {todayChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={cn(
                        "group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors cursor-pointer",
                        activeChatId === chat.id
                          ? "bg-muted"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => onChatSelect(chat.id)}
                    >
                      <span className="truncate text-muted-foreground">
                        {chat.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChatDelete(chat.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {yesterdayChats.length > 0 && (
              <div>
                <p className="mb-2 px-2 text-xs font-medium text-primary">Yesterday</p>
                <div className="space-y-1">
                  {yesterdayChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={cn(
                        "group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors cursor-pointer",
                        activeChatId === chat.id
                          ? "bg-muted"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => onChatSelect(chat.id)}
                    >
                      <span className="truncate text-muted-foreground">
                        {chat.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChatDelete(chat.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Menu */}
      <div className="border-t border-border p-3">
        <nav className="space-y-1">
          <button
            onClick={() => onViewChange("settings")}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activeView === "settings"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              isCollapsed && "justify-center px-2"
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </button>
          <button
            onClick={() => onViewChange("help")}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activeView === "help"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              isCollapsed && "justify-center px-2"
            )}
          >
            <HelpCircle className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Help Support</span>}
          </button>
        </nav>

        {/* User Profile */}
        {!isCollapsed && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="mt-3 flex w-full items-center gap-3 rounded-lg border border-border bg-background p-2 transition-colors hover:bg-muted">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
                  <AvatarFallback>MP</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">Mas Prabowo</p>
                  <p className="text-xs text-muted-foreground">prabowo@gmail.com</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => onViewChange("settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </aside>
  );
}
