"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Archive,
  Settings,
  HelpCircle,
  Plus,
  Trash2,
  PanelLeftClose,
  Menu,
  LogOut,
} from "lucide-react";

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
  created_at: string;
}

interface GroupedChats {
  today: Chat[];
  yesterday: Chat[];
  week: Chat[];
  older: Chat[];
}

interface UserSidebarProps {
  activeView: "chat" | "archived" | "library" | "settings" | "help";
  onViewChange: (view: any) => void;

  groupedChats: GroupedChats;
  loadMoreChats?: () => void;
  hasMoreChats?: boolean;

  activeChatId: string | null;
  onChatSelect: (id: string) => void;
  onChatDelete: (id: string) => void;
  onChatArchive?: (id: string) => void;

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
  groupedChats,
  activeChatId,
  onChatSelect,
  onChatDelete,
  onChatArchive,
  onNewChat,
  isCollapsed,
  onToggleCollapse,
  onMobileClose,
  isLoggedIn = false,
  userName = "Guest",
  userEmail = "",
  onLogout,
  onLoginRequest,
  loadMoreChats,
  hasMoreChats,
}: UserSidebarProps & { onMobileClose?: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { today = [], yesterday = [], week = [], older = [] } = groupedChats ?? {};

  const handleViewChange = (view: any) => {
    onViewChange(view);
    onMobileClose?.();
  };

  const handleChatSelect = (id: string) => {
    onChatSelect(id);
    onMobileClose?.();
  };

  // infinite scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (!hasMoreChats) return;

      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
        loadMoreChats?.();
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [loadMoreChats, hasMoreChats]);

  const renderGroup = (title: string, chats: Chat[]) => {
    if (!chats.length) return null;

    return (
      <div>
        <p className="mb-2 px-2 text-xs font-medium text-primary">{title}</p>

        <div className="space-y-0.5">
          {chats.map((chat) => (
            <DropdownMenu key={chat.id}>
              <div
                className={cn(
                  "group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors cursor-pointer",
                  activeChatId === chat.id ? "bg-muted" : "hover:bg-muted/60",
                )}
                onClick={() => handleChatSelect(chat.id)}
              >
                <span className="truncate text-muted-foreground flex-1">
                  {chat.title}
                </span>

                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <circle cx="4" cy="10" r="1.5" />
                      <circle cx="10" cy="10" r="1.5" />
                      <circle cx="16" cy="10" r="1.5" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
              </div>

              <DropdownMenuContent side="right" align="start" className="w-40">
                <DropdownMenuItem
                  onClick={() => {
                    onChatArchive?.(chat.id);
                    onMobileClose?.();
                  }}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChatDelete(chat.id);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-4 shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="LyraAI"
              width={32}
              height={32}
              className="rounded-xl"
            />
            <span className="font-semibold text-foreground">LyraAI</span>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="hidden md:flex h-8 w-8"
        >
          <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Scroll area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4">
        {/* New chat */}
        <Button
          onClick={() => {
            onNewChat();
            onMobileClose?.();
          }}
          className="mb-5 w-full gap-2 rounded-lg"
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && "New Chat"}
        </Button>

        {/* Navigation */}
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
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && item.label}
            </button>
          ))}
        </nav>

        {/* Chat groups */}
        {!isCollapsed && isLoggedIn && (
          <div className="mt-6 space-y-4">
            {renderGroup("Today", today)}
            {renderGroup("Yesterday", yesterday)}
            {renderGroup("This week", week)}
            {renderGroup("Older", older)}
          </div>
        )}

        {!isCollapsed && !isLoggedIn && (
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Login to save chat history
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="p-3 shrink-0">
        <button
          onClick={() => handleViewChange("settings")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted"
        >
          <Settings className="h-4 w-4" />
          {!isCollapsed && "Settings"}
        </button>

        <button
          onClick={() => handleViewChange("help")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted"
        >
          <HelpCircle className="h-4 w-4" />
          {!isCollapsed && "Help"}
        </button>

        {!isCollapsed && isLoggedIn && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="mt-3 flex w-full items-center gap-3 rounded-lg border border-border p-2 hover:bg-muted">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewChange("settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  onLogout?.();
                  onMobileClose?.();
                }}
                className="text-destructive"
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
      <aside
        className={cn(
          "hidden md:flex h-screen flex-col border-r border-border bg-background transition-all duration-300",
          props.isCollapsed ? "w-16" : "w-72",
        )}
      >
        <SidebarContent {...props} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-3 left-3 z-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>

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
