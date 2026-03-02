"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Mail,
    BarChart3,
    Users,
    Key,
    Cpu,
    Settings,
    HelpCircle,
    User,
    Sparkles,
    Search,
    FileText,
    Database,
    Shield,
    Zap,
} from "lucide-react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";

interface CommandItem {
    icon: React.ReactNode;
    title: string;
    description?: string;
    onSelect: () => void;
}

interface CommandMenuProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
    const router = useRouter();

    const pages: CommandItem[] = [
        {
            icon: <LayoutDashboard className="h-4 w-4" />,
            title: "Dashboard",
            description: "View your dashboard overview",
            onSelect: () => {
                router.push("/");
                onOpenChange(false);
            },
        },
        {
            icon: <Mail className="h-4 w-4" />,
            title: "Email & Message",
            description: "Manage emails and messages",
            onSelect: () => {
                router.push("/email");
                onOpenChange(false);
            },
        },
        {
            icon: <BarChart3 className="h-4 w-4" />,
            title: "Analytics",
            description: "View analytics and insights",
            onSelect: () => {
                router.push("/analytics");
                onOpenChange(false);
            },
        },
        {
            icon: <Users className="h-4 w-4" />,
            title: "User Management",
            description: "Manage users and permissions",
            onSelect: () => {
                router.push("/users");
                onOpenChange(false);
            },
        },
        {
            icon: <Key className="h-4 w-4" />,
            title: "API Keys",
            description: "Manage API keys and access",
            onSelect: () => {
                router.push("/api-keys");
                onOpenChange(false);
            },
        },
        {
            icon: <Cpu className="h-4 w-4" />,
            title: "Tokenizer",
            description: "Test and analyze tokens",
            onSelect: () => {
                router.push("/tokenizer");
                onOpenChange(false);
            },
        },
        {
            icon: <Sparkles className="h-4 w-4" />,
            title: "System Control",
            description: "Control system settings",
            onSelect: () => {
                router.push("/system");
                onOpenChange(false);
            },
        },
    ];

    const settings: CommandItem[] = [
        {
            icon: <Settings className="h-4 w-4" />,
            title: "Settings",
            description: "Configure your preferences",
            onSelect: () => {
                router.push("/settings");
                onOpenChange(false);
            },
        },
        {
            icon: <User className="h-4 w-4" />,
            title: "Profile",
            description: "View and edit your profile",
            onSelect: () => {
                router.push("/profile");
                onOpenChange(false);
            },
        },
        {
            icon: <HelpCircle className="h-4 w-4" />,
            title: "Help & Support",
            description: "Get help and support",
            onSelect: () => {
                router.push("/help");
                onOpenChange(false);
            },
        },
    ];

    const quickActions: CommandItem[] = [
        {
            icon: <Users className="h-4 w-4" />,
            title: "Add New User",
            description: "Create a new user account",
            onSelect: () => {
                router.push("/users");
                onOpenChange(false);
            },
        },
        {
            icon: <Key className="h-4 w-4" />,
            title: "Generate API Key",
            description: "Create a new API key",
            onSelect: () => {
                router.push("/api-keys");
                onOpenChange(false);
            },
        },
        {
            icon: <FileText className="h-4 w-4" />,
            title: "View Logs",
            description: "Check system logs",
            onSelect: () => {
                router.push("/system");
                onOpenChange(false);
            },
        },
        {
            icon: <Database className="h-4 w-4" />,
            title: "Database Status",
            description: "Check database health",
            onSelect: () => {
                router.push("/system");
                onOpenChange(false);
            },
        },
        {
            icon: <Shield className="h-4 w-4" />,
            title: "Security Settings",
            description: "Manage security options",
            onSelect: () => {
                router.push("/settings");
                onOpenChange(false);
            },
        },
        {
            icon: <Zap className="h-4 w-4" />,
            title: "Performance Monitor",
            description: "View system performance",
            onSelect: () => {
                router.push("/analytics");
                onOpenChange(false);
            },
        },
    ];

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Pages">
                    {pages.map((item, index) => (
                        <CommandItem key={index} onSelect={item.onSelect}>
                            {item.icon}
                            <div className="ml-2">
                                <p className="text-sm font-medium">{item.title}</p>
                                {item.description && (
                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                )}
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Quick Actions">
                    {quickActions.map((item, index) => (
                        <CommandItem key={index} onSelect={item.onSelect}>
                            {item.icon}
                            <div className="ml-2">
                                <p className="text-sm font-medium">{item.title}</p>
                                {item.description && (
                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                )}
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Settings">
                    {settings.map((item, index) => (
                        <CommandItem key={index} onSelect={item.onSelect}>
                            {item.icon}
                            <div className="ml-2">
                                <p className="text-sm font-medium">{item.title}</p>
                                {item.description && (
                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                )}
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
