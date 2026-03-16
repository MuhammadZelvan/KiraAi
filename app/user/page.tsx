"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { UserSidebar } from "@/components/user/UserSidebar";
import { UserHeader } from "@/components/user/UserHeader";
import { ChatInterface } from "@/components/user/ChatInterface";
import { LoginDialog } from "@/components/user/LoginDialog";
import { UserSettings } from "@/components/user/UserSettings";
import { UserHelp } from "@/components/user/UserHelp";
import { UserArchived } from "@/components/user/UserArchived";
import { getMe } from "@/lib/api";
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

  const searchParams = useSearchParams();

  const [loginOpen, setLoginOpen] = useState(false);
  const [loginMode, setLoginMode] = useState<"signin" | "signup">("signin");
  const [activeView, setActiveView] = useState<
    "chat" | "archived" | "library" | "settings" | "help"
  >("chat");

  const [chats, setChats] = useState<Chat[]>([]);
  const [archivedChats, setArchivedChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingChats, setLoadingChats] = useState(false);

  // ===============================
  // AUTH CHECK (STABLE VERSION)
  // ===============================
  useEffect(() => {
    async function checkAuth() {
      try {
        const data = await getMe();

        if (data?.id) {
          setIsLoggedIn(true);
          setUserName(data.name || data.email);
          setUserEmail(data.email);

          await loadConversations(true); // ← load sidebar data
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      } finally {
        setAuthLoading(false); // ← INI WAJIB
      }
    }

    checkAuth();
  }, []);

  // ===============================
  // AUTO-OPEN LOGIN/REGISTER FROM URL
  // ===============================
  useEffect(() => {
    const authParam = searchParams.get("auth");
    if (authParam === "login") {
      setLoginMode("signin");
      setLoginOpen(true);
    } else if (authParam === "register") {
      setLoginMode("signup");
      setLoginOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const reload = () => {
      setOffset(0);
      setHasMore(true);
      loadConversations(true);
    };

    window.addEventListener("conversations-updated", reload);

    return () => {
      window.removeEventListener("conversations-updated", reload);
    };
  }, []);

  // ===============================
  // LOGIN HANDLER
  // ===============================
  const handleLoginSuccess = async (name: string, email: string) => {
    setIsLoggedIn(true);
    setUserName(name);
    setUserEmail(email);
    setLoginOpen(false);

    setOffset(0);
    setHasMore(true);

    await loadConversations(true); // reset pagination
  };

  // ===============================
  // LOGOUT HANDLER
  // ===============================
  const handleLogout = async () => {
    try {
      await logout();

      setIsLoggedIn(false);
      setChats([]);
      setActiveChatId(null);

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
  // NEW CHAT (NO FAKE ID)
  // ===============================
  const handleNewChat = useCallback(() => {
    setActiveChatId(null); // backend will create conversation
    setActiveView("chat");
  }, []);

  // ===============================
  // DELETE CHAT (frontend only for now)
  // ===============================
  const handleDeleteChat = async (id: string) => {
    try {
      await deleteConversation(id);

      setChats((prev) => prev.filter((c) => c.id !== id));

      if (activeChatId === id) {
        setActiveChatId(null);
      }
    } catch (err) {
      console.error("Delete failed");
    }
  };

  // ===============================
  // ARCHIVE (keep your old behavior)
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
  if (authLoading) {
    return null;
  }

  // ===============================
  // RENDER CONTENT
  // ===============================
  const renderContent = () => {
    if (authLoading) {
      return null; // tunggu auth selesai
    }

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
              setActiveView("chat");
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
          />
        );

      case "settings":
        return <UserSettings />;

      case "help":
        return <UserHelp />;

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
        onChatSelect={setActiveChatId}
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
        initialMode={loginMode}
      />
    </div>
  );
}
