"use client";

import { useState } from "react";
import { UserSidebar } from "@/components/user/UserSidebar";
import { UserHeader } from "@/components/user/UserHeader";
import { ChatInterface } from "@/components/user/ChatInterface";

interface Chat {
    id: string;
    title: string;
    date: "today" | "yesterday";
}

const initialChats: Chat[] = [
    { id: "1", title: "Lorem ipsum dolor sit amet, cons...", date: "today" },
    { id: "2", title: "Lorem ipsum dolor sit amet, cons...", date: "today" },
    { id: "3", title: "Lorem ipsum dolor sit amet, cons...", date: "yesterday" },
    { id: "4", title: "Lorem ipsum dolor sit amet, cons...", date: "yesterday" },
    { id: "5", title: "Lorem ipsum dolor sit amet, cons...", date: "yesterday" },
];

export default function ChatPage() {
    const [activeView, setActiveView] = useState<"chat" | "archived" | "library" | "settings" | "help">("chat");
    const [chats, setChats] = useState<Chat[]>(initialChats);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleNewChat = () => {
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
        if (activeChatId === id) {
            setActiveChatId(null);
        }
    };

    const getPageTitle = () => {
        switch (activeView) {
            case "chat":
                return "Dashboard";
            case "archived":
                return "Archived";
            case "library":
                return "Library";
            case "settings":
                return "Settings";
            case "help":
                return "Help Support";
            default:
                return "Dashboard";
        }
    };

    const renderContent = () => {
        switch (activeView) {
            case "chat":
                return <ChatInterface userName="Mas Prabowo" />;
            case "archived":
                return (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">Archived chats will appear here</p>
                    </div>
                );
            case "library":
                return (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">Your library will appear here</p>
                    </div>
                );
            case "settings":
                return (
                    <div className="mx-auto max-w-5xl space-y-6 p-6">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                            <p className="text-muted-foreground">Coming soon — user preferences.</p>
                        </div>
                    </div>
                );
            case "help":
                return (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">Help & Support content will appear here</p>
                    </div>
                );
            default:
                return <ChatInterface userName="Mas Prabowo" />;
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
            />
            <div className="flex flex-1 flex-col">
                <UserHeader
                    currentPage={getPageTitle()}
                    onNewChat={handleNewChat}
                    isLoggedIn={true}
                />
                <main className="flex-1 overflow-auto bg-background">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}
