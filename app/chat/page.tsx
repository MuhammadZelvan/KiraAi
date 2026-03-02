"use client";

import { useState, useEffect } from "react";
import { UserSidebar } from "@/components/user/UserSidebar";
import { UserHeader } from "@/components/user/UserHeader";
import { ChatInterface } from "@/components/user/ChatInterface";
import { LoginDialog } from "@/components/user/LoginDialog";
import { UserSettings } from "@/components/user/UserSettings";
import { UserHelp } from "@/components/user/UserHelp";
import { UserArchived } from "@/components/user/UserArchived";

interface Chat {
    id: string;
    title: string;
    date: "today" | "yesterday";
}

// Guest mode: no chat history shown
const guestChats: Chat[] = [];

// Logged-in user mock history
const userChats: Chat[] = [
    { id: "1", title: "Lorem ipsum dolor sit amet, cons...", date: "today" },
    { id: "2", title: "Lorem ipsum dolor sit amet, cons...", date: "today" },
    { id: "3", title: "Lorem ipsum dolor sit amet, cons...", date: "yesterday" },
    { id: "4", title: "Lorem ipsum dolor sit amet, cons...", date: "yesterday" },
    { id: "5", title: "Lorem ipsum dolor sit amet, cons...", date: "yesterday" },
];

export default function ChatPage() {
    // Auth state — false = guest mode
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState("Guest");
    const [userEmail, setUserEmail] = useState("");

    // Login dialog state
    const [loginOpen, setLoginOpen] = useState(false);

    // Auto-open login popup on first visit (only once per session)
    useEffect(() => {
        const dismissed = sessionStorage.getItem("login-popup-dismissed");
        if (!isLoggedIn && !dismissed) {
            const timer = setTimeout(() => setLoginOpen(true), 800);
            return () => clearTimeout(timer);
        }
    }, [isLoggedIn]);

    const handleLoginDialogChange = (open: boolean) => {
        setLoginOpen(open);
        if (!open) {
            // Mark as dismissed so it won't auto-open again this session
            sessionStorage.setItem("login-popup-dismissed", "true");
        }
    };

    const handleLoginSuccess = (name: string, email: string) => {
        setIsLoggedIn(true);
        setUserName(name);
        setUserEmail(email);
        setLoginOpen(false);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserName("Guest");
        setUserEmail("");
        sessionStorage.removeItem("login-popup-dismissed");
    };

    const [activeView, setActiveView] = useState<"chat" | "archived" | "library" | "settings" | "help">("chat");
    const [chats, setChats] = useState<Chat[]>(guestChats);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Update chat history based on login state
    useEffect(() => {
        setChats(isLoggedIn ? userChats : guestChats);
    }, [isLoggedIn]);

    const handleNewChat = () => {
        if (!isLoggedIn) {
            // Guest: allow chatting but no history
            setActiveChatId(null);
            setActiveView("chat");
            return;
        }
        const newChat: Chat = {
            id: `chat-${Date.now()}`,
            title: `New conversation ${chats.length + 1}`,
            date: "today",
        };
        setChats([newChat, ...chats]);
        setActiveChatId(newChat.id);
        setActiveView("chat");
    };

    const handleDeleteChat = (id: string) => {
        setChats(chats.filter((chat) => chat.id !== id));
        if (activeChatId === id) setActiveChatId(null);
    };

    const getPageTitle = () => {
        switch (activeView) {
            case "chat": return "Dashboard";
            case "archived": return "Archived";
            case "library": return "Library";
            case "settings": return "Settings";
            case "help": return "Help Support";
            default: return "Dashboard";
        }
    };

    const renderContent = () => {
        switch (activeView) {
            case "chat":
                return (
                    <ChatInterface
                        userName={isLoggedIn ? userName : "Guest"}
                        activeChatId={activeChatId}
                        isGuest={!isLoggedIn}
                        onLoginRequest={() => setLoginOpen(true)}
                        recentChats={chats}
                        onChatSelect={(id) => {
                            setActiveChatId(id);
                            setActiveView("chat");
                        }}
                    />
                );
            case "archived":
                return (
                    <UserArchived
                        isLoggedIn={isLoggedIn}
                        onLoginRequest={() => setLoginOpen(true)}
                    />
                );
            case "settings":
                return <UserSettings />;
            case "help":
                return <UserHelp />;
            default:
                return <ChatInterface userName={isLoggedIn ? userName : "Guest"} isGuest={!isLoggedIn} onLoginRequest={() => setLoginOpen(true)} />;
        }
    };

    return (
        <div className="flex h-screen w-full bg-background">
            <UserSidebar
                activeView={activeView}
                onViewChange={setActiveView}
                chats={chats}
                activeChatId={activeChatId}
                onChatSelect={setActiveChatId}
                onChatDelete={handleDeleteChat}
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
                    currentPage={getPageTitle()}
                    onNewChat={handleNewChat}
                    isLoggedIn={isLoggedIn}
                    onLoginRequest={() => setLoginOpen(true)}
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
