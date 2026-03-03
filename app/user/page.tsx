"use client";

import { useState, useCallback, useEffect } from "react";
import { UserSidebar } from "@/components/user/UserSidebar";
import { UserHeader } from "@/components/user/UserHeader";
import { ChatInterface } from "@/components/user/ChatInterface";
import { LoginDialog } from "@/components/user/LoginDialog";
import { UserSettings } from "@/components/user/UserSettings";
import { UserHelp } from "@/components/user/UserHelp";
import { UserArchived } from "@/components/user/UserArchived";

export interface Chat {
    id: string;
    title: string;
    date: "today" | "yesterday";
    archived?: boolean;
    messages?: { role: "user" | "assistant"; content: string }[];
}

export default function ChatPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem("lyra_isLoggedIn") === "true";
    });
    const [userName, setUserName] = useState(() => {
        if (typeof window === "undefined") return "Guest";
        return localStorage.getItem("lyra_userName") ?? "Guest";
    });
    const [userEmail, setUserEmail] = useState(() => {
        if (typeof window === "undefined") return "";
        return localStorage.getItem("lyra_userEmail") ?? "";
    });
    const [loginOpen, setLoginOpen] = useState(false);
    const [activeView, setActiveView] = useState<"chat" | "archived" | "library" | "settings" | "help">("chat");
    const [chats, setChats] = useState<Chat[]>(() => {
        if (typeof window === "undefined") return [];
        try { return JSON.parse(localStorage.getItem("lyra_chats") ?? "[]"); } catch { return []; }
    });
    const [archivedChats, setArchivedChats] = useState<Chat[]>(() => {
        if (typeof window === "undefined") return [];
        try { return JSON.parse(localStorage.getItem("lyra_archivedChats") ?? "[]"); } catch { return []; }
    });
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [headerSearch, setHeaderSearch] = useState("");

    // Persist chats to localStorage whenever they change
    useEffect(() => { localStorage.setItem("lyra_chats", JSON.stringify(chats)); }, [chats]);
    useEffect(() => { localStorage.setItem("lyra_archivedChats", JSON.stringify(archivedChats)); }, [archivedChats]);

    // ── Auth ──────────────────────────────────────────────
    const handleLoginDialogChange = (open: boolean) => {
        setLoginOpen(open);
        if (!open) sessionStorage.setItem("login-popup-dismissed", "true");
    };

    const handleLoginSuccess = (name: string, email: string) => {
        setIsLoggedIn(true);
        setUserName(name);
        setUserEmail(email);
        setLoginOpen(false);
        localStorage.setItem("lyra_isLoggedIn", "true");
        localStorage.setItem("lyra_userName", name);
        localStorage.setItem("lyra_userEmail", email);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserName("Guest");
        setUserEmail("");
        setChats([]);
        setArchivedChats([]);
        setActiveChatId(null);
        localStorage.removeItem("lyra_isLoggedIn");
        localStorage.removeItem("lyra_userName");
        localStorage.removeItem("lyra_userEmail");
        localStorage.removeItem("lyra_chats");
        localStorage.removeItem("lyra_archivedChats");
        sessionStorage.removeItem("login-popup-dismissed");
    };

    // ── Chats ─────────────────────────────────────────────
    const handleNewChat = useCallback(() => {
        const newChat: Chat = {
            id: `chat-${Date.now()}`,
            title: "New conversation",
            date: "today",
            messages: [],
        };
        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.id);
        setActiveView("chat");
    }, []);

    const handleDeleteChat = (id: string) => {
        setChats((prev) => prev.filter((c) => c.id !== id));
        if (activeChatId === id) setActiveChatId(null);
    };

    /** Called when the user sends their very first message — auto-sets the chat title */
    const handleFirstMessage = useCallback((text: string) => {
        // Take first ~40 chars of first message as title
        const title = text.length > 40 ? text.slice(0, 40) + "..." : text;
        setChats((prev) =>
            prev.map((c) => (c.id === activeChatId ? { ...c, title } : c))
        );
    }, [activeChatId]);

    // ── Archive / Unarchive ───────────────────────────────
    const handleArchiveChat = useCallback((id: string) => {
        const chat = chats.find((c) => c.id === id);
        if (!chat) return;
        setChats((prev) => prev.filter((c) => c.id !== id));
        setArchivedChats((prev) => [{ ...chat, archived: true }, ...prev]);
        if (activeChatId === id) setActiveChatId(null);
    }, [chats, activeChatId]);

    const handleUnarchiveChat = useCallback((id: string) => {
        const chat = archivedChats.find((c) => c.id === id);
        if (!chat) return;
        setArchivedChats((prev) => prev.filter((c) => c.id !== id));
        setChats((prev) => [{ ...chat, archived: false }, ...prev]);
    }, [archivedChats]);

    const handleDeleteArchived = useCallback((id: string) => {
        setArchivedChats((prev) => prev.filter((c) => c.id !== id));
    }, []);

    // ── Share ─────────────────────────────────────────────
    const handleShareChat = useCallback((id: string) => {
        const chat = chats.find((c) => c.id === id);
        const shareUrl = `${window.location.origin}/shared/${id}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            // toast is handled in UserHeader
        }).catch(() => { });
        return shareUrl;
    }, [chats]);

    // ── Search ────────────────────────────────────────────
    const filteredChats = headerSearch.trim()
        ? chats.filter((c) => c.title.toLowerCase().includes(headerSearch.toLowerCase()))
        : chats;

    // ── Rendering ─────────────────────────────────────────
    const renderContent = () => {
        switch (activeView) {
            case "chat":
                return (
                    <ChatInterface
                        userName={isLoggedIn ? userName : "Guest"}
                        activeChatId={activeChatId}
                        isGuest={!isLoggedIn}
                        onLoginRequest={() => setLoginOpen(true)}
                        recentChats={filteredChats.slice(0, 3)}
                        onChatSelect={(id) => { setActiveChatId(id); setActiveView("chat"); }}
                        onFirstMessage={handleFirstMessage}
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
                return (
                    <ChatInterface
                        userName={isLoggedIn ? userName : "Guest"}
                        isGuest={!isLoggedIn}
                        onLoginRequest={() => setLoginOpen(true)}
                    />
                );
        }
    };

    return (
        <div className="flex h-screen w-full bg-background">
            <UserSidebar
                activeView={activeView}
                onViewChange={setActiveView}
                chats={filteredChats}
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
            />
            <div className="flex flex-1 flex-col overflow-hidden">
                <UserHeader
                    currentPage={activeView}
                    onNewChat={handleNewChat}
                    isLoggedIn={isLoggedIn}
                    onLoginRequest={() => setLoginOpen(true)}
                    activeChatId={activeChatId}
                    onShare={handleShareChat}
                    searchValue={headerSearch}
                    onSearchChange={setHeaderSearch}
                />
                <main className="flex-1 overflow-auto bg-background">
                    {renderContent()}
                </main>
            </div>

            <LoginDialog
                open={loginOpen}
                onOpenChange={handleLoginDialogChange}
                onLoginSuccess={handleLoginSuccess}
            />
        </div>
    );
}
