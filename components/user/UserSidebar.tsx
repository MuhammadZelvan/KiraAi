"use client";

import { useState } from "react";
import { MessageCircle, Archive, Settings, HelpCircle, Plus, Trash2, PanelLeftClose, Menu, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";

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
  isLoggedIn?: boolean;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  onLoginRequest?: () => void;
}

const menuItems = [
  { id: "chat" as const, label: "Chat", icon: MessageCircle },
  { id: "archived" as const, label: "Archived", icon: Archive },
];

function SidebarContent({
  activeView,
  onViewChange,
  chats,
  activeChatId,
  onChatSelect,
  onChatDelete,
  onNewChat,
  isCollapsed,
  onToggleCollapse,
  onMobileClose,
  isLoggedIn = false,
  userName = "Guest",
  userEmail = "",
  onLogout,
  onLoginRequest,
}: UserSidebarProps & { onMobileClose?: () => void }) {
  const todayChats = chats.filter((c) => c.date === "today");
  const yesterdayChats = chats.filter((c) => c.date === "yesterday");

  const handleViewChange = (view: typeof activeView) => {
    onViewChange(view);
    onMobileClose?.();
  };

  const handleChatSelect = (id: string) => {
    onChatSelect(id);
    onMobileClose?.();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header: Logo + Collapse */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4 shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="LyraAI" width={32} height={32} className="rounded-xl object-contain" />
            <span className="font-semibold text-foreground">LyraAI</span>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto">
            <Image src="/logo.png" alt="LyraAI" width={32} height={32} className="rounded-xl object-contain" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className={cn("h-8 w-8 hidden md:flex shrink-0", isCollapsed && "mx-auto mt-2")}
        >
          <PanelLeftClose className={cn("h-4 w-4 text-muted-foreground transition-transform duration-300", isCollapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {/* New Chat Button */}
        {!isCollapsed ? (
          <Button
            onClick={() => { onNewChat(); onMobileClose?.(); }}
            className="mb-5 w-full gap-2 rounded-lg"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        ) : (
          <Button
            onClick={() => { onNewChat(); onMobileClose?.(); }}
            size="icon"
            className="mb-5 w-full rounded-lg"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {/* Features label */}
        {!isCollapsed && (
          <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">Features</p>
        )}

        {/* Feature nav items */}
        <nav className="space-y-0.5">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleViewChange(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                activeView === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Chat History — only for logged-in users */}
        {!isCollapsed && isLoggedIn && (
          <div className="mt-6 space-y-4">
            {todayChats.length > 0 && (
              <div>
                <p className="mb-2 px-2 text-xs font-medium text-primary">Today</p>
                <div className="space-y-0.5">
                  {todayChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={cn(
                        "group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors cursor-pointer",
                        activeChatId === chat.id ? "bg-muted" : "hover:bg-muted/60"
                      )}
                      onClick={() => handleChatSelect(chat.id)}
                    >
                      <span className="truncate text-muted-foreground">{chat.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); onChatDelete(chat.id); }}
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
                <div className="space-y-0.5">
                  {yesterdayChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={cn(
                        "group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors cursor-pointer",
                        activeChatId === chat.id ? "bg-muted" : "hover:bg-muted/60"
                      )}
                      onClick={() => handleChatSelect(chat.id)}
                    >
                      <span className="truncate text-muted-foreground">{chat.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); onChatDelete(chat.id); }}
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

        {/* Guest: show hint that history requires login */}
        {!isCollapsed && !isLoggedIn && (
          <div className="mt-6 rounded-lg border border-dashed border-border p-3 text-center">
            <p className="text-xs text-muted-foreground mb-2">Login to save chat history</p>
            <button
              onClick={onLoginRequest}
              className="text-xs font-medium text-primary hover:underline"
            >
              Sign in
            </button>
          </div>
        )}
      </div>

      {/* Bottom: Settings + Help + (User account if logged in) */}
      <div className="border-t border-border p-3 shrink-0">
        <nav className="space-y-0.5">
          <button
            onClick={() => handleViewChange("settings")}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activeView === "settings"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Settings" : undefined}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </button>
          <button
            onClick={() => handleViewChange("help")}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activeView === "help"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Help Support" : undefined}
          >
            <HelpCircle className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Help Support</span>}
          </button>
        </nav>

        {/* User profile — only when logged in */}
        {!isCollapsed && isLoggedIn && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="mt-3 flex w-full items-center gap-3 rounded-lg border border-border bg-background p-2 transition-colors hover:bg-muted">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
                  <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                  <p className="text-xs text-muted-foreground truncate">{userEmail || "user@LyraAI.com"}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleViewChange("settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => { onLogout?.(); onMobileClose?.(); }}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export function UserSidebar(props: UserSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex h-screen flex-col border-r border-border bg-card transition-all duration-300 shrink-0",
          props.isCollapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent {...props} />
      </aside>

      {/* Mobile hamburger + Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-3 left-3 z-50 h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarContent
            {...props}
            isCollapsed={false}
            onMobileClose={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
