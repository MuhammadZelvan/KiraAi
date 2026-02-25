"use client";

import { Bell, Check, UserPlus, AlertCircle, MessageSquare, Settings, TrendingUp } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState } from "react";

type NotificationType = "info" | "success" | "warning" | "message";

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    time: string;
    read: boolean;
    icon: React.ReactNode;
}

const initialNotifications: Notification[] = [
    {
        id: "1",
        type: "success",
        title: "New User Registered",
        message: "John Doe just created an account",
        time: "2 minutes ago",
        read: false,
        icon: <UserPlus className="h-4 w-4" />,
    },
    {
        id: "2",
        type: "warning",
        title: "High API Usage",
        message: "API usage reached 85% of monthly limit",
        time: "15 minutes ago",
        read: false,
        icon: <AlertCircle className="h-4 w-4" />,
    },
    {
        id: "3",
        type: "message",
        title: "New Message",
        message: "You have 3 unread messages from support",
        time: "1 hour ago",
        read: false,
        icon: <MessageSquare className="h-4 w-4" />,
    },
    {
        id: "4",
        type: "info",
        title: "System Update",
        message: "New features are now available in settings",
        time: "2 hours ago",
        read: true,
        icon: <Settings className="h-4 w-4" />,
    },
    {
        id: "5",
        type: "success",
        title: "Performance Boost",
        message: "Your AI model response time improved by 23%",
        time: "5 hours ago",
        read: true,
        icon: <TrendingUp className="h-4 w-4" />,
    },
];

const notificationStyles: Record<NotificationType, { bg: string; text: string; border: string }> = {
    info: {
        bg: "bg-blue-500/10",
        text: "text-blue-500",
        border: "border-blue-500/20",
    },
    success: {
        bg: "bg-green-500/10",
        text: "text-green-500",
        border: "border-green-500/20",
    },
    warning: {
        bg: "bg-orange-500/10",
        text: "text-orange-500",
        border: "border-orange-500/20",
    },
    message: {
        bg: "bg-purple-500/10",
        text: "text-purple-500",
        border: "border-purple-500/20",
    },
};

export function NotificationPopover() {
    const [notifications, setNotifications] = useState(initialNotifications);
    const [open, setOpen] = useState(false);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-[10px] font-bold text-white shadow-lg shadow-red-500/50 ring-2 ring-card animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="end">
                <div className="flex items-center justify-between border-b border-border p-4">
                    <div>
                        <h3 className="font-semibold text-foreground">Notifications</h3>
                        <p className="text-xs text-muted-foreground">
                            You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-8 text-xs"
                        >
                            <Check className="mr-1 h-3 w-3" />
                            Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Bell className="mb-2 h-12 w-12 text-muted-foreground/50" />
                            <p className="text-sm font-medium text-muted-foreground">No notifications</p>
                            <p className="text-xs text-muted-foreground">You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map((notification) => {
                                const style = notificationStyles[notification.type];
                                return (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "group relative flex gap-3 p-4 transition-colors hover:bg-muted/50",
                                            !notification.read && "bg-muted/30"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                                                style.bg,
                                                style.text,
                                                style.border
                                            )}
                                        >
                                            {notification.icon}
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none text-foreground">
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{notification.message}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-muted-foreground">{notification.time}</p>
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="text-xs text-primary hover:underline"
                                                    >
                                                        Mark as read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                {notifications.length > 0 && (
                    <div className="border-t border-border p-2">
                        <Button
                            variant="ghost"
                            className="w-full text-xs text-primary hover:bg-primary/10 hover:text-primary"
                        >
                            View all notifications
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
