"use client";

import { useState, useCallback, useEffect } from "react";
import { UserSidebar } from "@/components/user/UserSidebar";
import { UserHeader } from "@/components/user/UserHeader";
import { ChatInterface } from "@/components/user/ChatInterface";
import { LoginDialog } from "@/components/user/LoginDialog";
import { UserSettings } from "@/components/user/UserSettings";
import { UserHelp } from "@/components/user/UserHelp";
import { UserArchived } from "@/components/user/UserArchived";
import { getMe, getSettings } from "@/lib/api";
import { deleteConversation } from "@/lib/api";
import { archiveConversation, unarchiveConversation } from "@/lib/api";
import { logout } from "@/lib/api";
import { groupChats } from "@/lib/utils";

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  archived?: boolean;
  messages?: { role: "user" | "assistant"; content: string }[];
}

export default function ChatPage() {
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const [userEmail, setUserEmail] = useState("");

  const [loginOpen, setLoginOpen] = useState(false);
  const [activeView, setActiveView] = useState<
    "chat" | "archived" | "library" | "settings" | "help"
  >("chat");

  const [chats, setChats] = useState<Chat[]>([]);
  const [archivedChats, setArchivedChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("activeChatId");
  });
  const [uiReady, setUiReady] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingChats, setLoadingChats] = useState(false);

  // Helper: load display name from user data (username), fallback to email
  const loadDisplayName = async (fallbackEmail: string) => {
    try {
      const data = await getMe();
      setUserName(data?.username || data?.name || fallbackEmail);
    } catch {
      setUserName(fallbackEmail);
    }
  };

  // ===============================
  // AUTH CHECK
  // ===============================
  useEffect(() => {
    async function checkAuth() {
      try {
        const data = await getMe();

        if (data?.id) {
          setIsLoggedIn(true);
          setUserEmail(data.email);
          await loadDisplayName(data.email);
          await loadConversations(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      } finally {
        setAuthLoading(false);
      }
    }

    checkAuth();
  }, []);

  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem("activeChatId", activeChatId);
    } else {
      localStorage.removeItem("activeChatId");
    }
  }, [activeChatId]);

  useEffect(() => {
    const saved = localStorage.getItem("activeChatId");
    if (saved) setActiveChatId(saved);
    setUiReady(true);
  }, []);

  useEffect(() => {
    const reload = async () => {
      try {
        const data = await getMe();
        if (data?.id) {
          setOffset(0);
          setHasMore(true);
          await loadDisplayName(data.email);
          loadConversations(true);
        } else {
          setIsLoggedIn(false);
          setUserName("Guest");
          setUserEmail("");
          setChats([]);
          setActiveChatId(null);
          setActiveView("chat");
        }
      } catch {
        setIsLoggedIn(false);
        setUserName("Guest");
        setUserEmail("");
        setChats([]);
        setActiveChatId(null);
        setActiveView("chat");
      }
    };

    window.addEventListener("conversations-updated", reload);
    return () => window.removeEventListener("conversations-updated", reload);
  }, []);

  // ===============================
  // LOGIN HANDLER
  // ===============================
  const handleLoginSuccess = async (name: string, email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    // name already contains username from LoginDialog finishLogin
    setUserName(name || email);
    setLoginOpen(false);
    setOffset(0);
    setHasMore(true);
    await loadConversations(true);
  };

  // ===============================
  // LOGOUT HANDLER
  // ===============================
  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      setUserName("Guest");
      setUserEmail("");
      setChats([]);
      setActiveChatId(null);
      setActiveView("chat");
      window.dispatchEvent(new Event("conversations-updated"));
    } catch (err) {
      console.error("Logout failed");
    }
  };

  const loadConversations = async (reset = false) => {
    if (loadingChats) return;

    setLoadingChats(true);

    const res = await fetch(
      `http://localhost:4000/chat/conversations?limit=20&offset=${reset ? 0 : offset}`,
      { credentials: "include" },
    );

    if (!res.ok) {
      setLoadingChats(false);
      return;
    }

    const data = await res.json();

    const mapped = data.map((c: any) => ({
      id: c.id,
      title: c.title ?? "New conversation",
      created_at: c.created_at,
    }));

    if (reset) {
      setChats(mapped);
      setOffset(20);
    } else {
      setChats((prev) => [...prev, ...mapped]);
      setOffset((prev) => prev + 20);
    }

    if (data.length < 20) setHasMore(false);

    setLoadingChats(false);
  };

  // ===============================
  // NEW CHAT
  // ===============================
  const handleNewChat = useCallback(() => {
    setActiveChatId(null);
    localStorage.removeItem("activeChatId");
    setActiveView("chat");
  }, []);

  // ===============================
  // DELETE CHAT
  // ===============================
  const handleDeleteChat = async (id: string) => {
    try {
      await deleteConversation(id);
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (activeChatId === id) setActiveChatId(null);
    } catch (err) {
      console.error("Delete failed");
    }
  };

  // ===============================
  // ARCHIVE
  // ===============================
  const handleArchiveChat = useCallback(
    async (id: string) => {
      try {
        await archiveConversation(id);
        const chat = chats.find((c) => c.id === id);
        if (!chat) return;
        setChats((prev) => prev.filter((c) => c.id !== id));
        setArchivedChats((prev) => [{ ...chat, archived: true }, ...prev]);
        if (activeChatId === id) setActiveChatId(null);
      } catch (err) {
        console.error("Archive failed");
      }
    },
    [chats, activeChatId],
  );

  const handleUnarchiveChat = useCallback(
    async (id: string) => {
      try {
        await unarchiveConversation(id);
        const chat = archivedChats.find((c) => c.id === id);
        if (!chat) return;
        setArchivedChats((prev) => prev.filter((c) => c.id !== id));
        setChats((prev) => [{ ...chat, archived: false }, ...prev]);
      } catch (err) {
        console.error("Unarchive failed");
      }
    },
    [archivedChats],
  );

  const handleDeleteArchived = useCallback(async (id: string) => {
    try {
      await deleteConversation(id);
      setArchivedChats((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Delete failed");
    }
  }, []);

  // ===============================
  // SEARCH
  // ===============================
  const filteredChats = headerSearch.trim()
    ? chats.filter((c) =>
        c.title.toLowerCase().includes(headerSearch.toLowerCase()),
      )
    : chats;

  const groupedChats = groupChats(filteredChats);

  // ===============================
  // PREVENT FLICKER
  // ===============================
  if (authLoading || !uiReady) return null;

  // ===============================
  // RENDER CONTENT
  // ===============================
  const renderContent = () => {
    if (authLoading) return null;

    switch (activeView) {
      case "chat":
        return (
          <ChatInterface
            userName={isLoggedIn ? userName : "Guest"}
            activeChatId={activeChatId}
            isGuest={!isLoggedIn}
            onLoginRequest={() => setLoginOpen(true)}
            recentChats={filteredChats.slice(0, 3)}
            onChatSelect={(id) => {
              setActiveChatId(id);
              localStorage.setItem("activeChatId", id);
            }}
            onChatCreated={async (id) => {
              setActiveChatId(id);
              await loadConversations(true);
            }}
          />
        );

      case "archived":
        return (
          <UserArchived
            isLoggedIn={isLoggedIn}
            onLoginRequest={() => setLoginOpen(true)}
            archivedChats={archivedChats}
            onUnarchive={handleUnarchiveChat}
            onDelete={handleDeleteArchived}
            onChatSelect={(id) => {
              setActiveChatId(id);
              setActiveView("chat");
            }}
          />
        );

      case "settings":
        return (
          <UserSettings
            onSettingsSaved={async () => {
              if (userEmail) await loadDisplayName(userEmail);
            }}
          />
        );

      case "help":
        return (
          <UserHelp
            isLoggedIn={isLoggedIn}
            userEmail={userEmail}
            userName={userName}
            onLoginRequest={() => setLoginOpen(true)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <UserSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        groupedChats={groupedChats}
        activeChatId={activeChatId}
        onChatSelect={(id) => {
          setActiveChatId(id);
          setActiveView("chat");
        }}
        onChatDelete={handleDeleteChat}
        onChatArchive={handleArchiveChat}
        onNewChat={handleNewChat}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isLoggedIn={isLoggedIn}
        userName={userName}
        userEmail={userEmail}
        onLogout={handleLogout}
        onLoginRequest={() => setLoginOpen(true)}
        loadMoreChats={() => loadConversations(false)}
        hasMoreChats={hasMore}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <UserHeader
          currentPage={activeView}
          onNewChat={handleNewChat}
          isLoggedIn={isLoggedIn}
          onLoginRequest={() => setLoginOpen(true)}
          activeChatId={activeChatId}
          searchValue={headerSearch}
          onSearchChange={setHeaderSearch}
        />

        <main className="flex-1 overflow-auto bg-background">
          {renderContent()}
        </main>
      </div>

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
