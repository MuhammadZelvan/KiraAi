"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Plus,
    Filter,
    ArrowUpDown,
    MoreHorizontal,
    ChevronDown,
    ChevronUp,
    Eye,
    EyeOff,
    Copy,
    Trash2,
    Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { AddAPIKeyDialog, type APIKey } from "@/components/apikeys/AddAPIKeyDialog";
import { DatePickerDemo } from "@/components/apikeys/DatePicker";

interface KeySection {
    id: string;
    title: string;
    type: "publishable" | "secret";
    keys: APIKey[];
}

type FilterType = "all" | "publishable" | "secret";
type SortType = "name-asc" | "name-desc" | "date-new" | "date-old";

export default function APIKeysPage() {
    const { toast } = useToast();
    const [openSections, setOpenSections] = useState<string[]>(["publishable", "secret"]);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
    const [addKeyDialogOpen, setAddKeyDialogOpen] = useState(false);
    const [filter, setFilter] = useState<FilterType>("all");
    const [sortBy, setSortBy] = useState<SortType>("name-asc");

    const [keySections, setKeySections] = useState<KeySection[]>([
        {
            id: "publishable",
            title: "Publishable key",
            type: "publishable",
            keys: [
                {
                    id: "pk_1",
                    name: "Public Key",
                    key: "pk_live_Y2xlcmsub2VyZmFkYS5jb0",
                    type: "publishable",
                    createdAt: "2024-01-15",
                    canDelete: false
                },
            ],
        },
        {
            id: "secret",
            title: "Secret Keys",
            type: "secret",
            keys: [
                {
                    id: "sk_1",
                    name: "Default Secret Key",
                    key: "sk_live_Y2xlcmsub2VyZmFkYS5jb0",
                    type: "secret",
                    createdAt: "2024-01-10",
                    canDelete: false
                },
                {
                    id: "sk_2",
                    name: "Test",
                    key: "sk_live_Y2xlcmsub2VyZmFkYS5jb0",
                    type: "secret",
                    createdAt: "2024-02-01",
                    canDelete: false
                },
                {
                    id: "sk_3",
                    name: "Testing Token",
                    key: "sk_live_Y2xlcmsub2VyZmFkYS5jb0",
                    type: "secret",
                    createdAt: "2024-03-15",
                    canDelete: true
                },
            ],
        },
    ]);

    const toggleSection = (sectionId: string) => {
        setOpenSections((prev) =>
            prev.includes(sectionId)
                ? prev.filter((id) => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const toggleKeySelection = (keyId: string) => {
        setSelectedKeys((prev) =>
            prev.includes(keyId)
                ? prev.filter((id) => id !== keyId)
                : [...prev, keyId]
        );
    };

    const toggleKeyVisibility = (keyId: string) => {
        setVisibleKeys((prev) =>
            prev.includes(keyId)
                ? prev.filter((id) => id !== keyId)
                : [...prev, keyId]
        );
    };

    const copyToClipboard = (key: string, name: string) => {
        navigator.clipboard.writeText(key);
        toast({
            title: "Copied!",
            description: `API key "${name}" copied to clipboard`,
        });
    };

    const maskKey = (key: string) => {
        return key.substring(0, 12) + "..." + key.substring(key.length - 4);
    };

    const handleAddKey = (newKey: APIKey) => {
        setKeySections(sections =>
            sections.map(section => {
                if (section.type === newKey.type) {
                    return {
                        ...section,
                        keys: [...section.keys, newKey]
                    };
                }
                return section;
            })
        );
    };

    const handleDeleteKey = (keyId: string) => {
        setKeySections(sections =>
            sections.map(section => ({
                ...section,
                keys: section.keys.filter(k => k.id !== keyId)
            }))
        );
        toast({
            title: "API Key Deleted",
            description: "The API key has been permanently deleted.",
            variant: "destructive",
        });
    };

    const handleBulkDelete = () => {
        if (selectedKeys.length === 0) {
            toast({
                title: "No Keys Selected",
                description: "Please select at least one API key to delete.",
                variant: "destructive",
            });
            return;
        }

        setKeySections(sections =>
            sections.map(section => ({
                ...section,
                keys: section.keys.filter(k => !selectedKeys.includes(k.id) || !k.canDelete)
            }))
        );

        toast({
            title: "Keys Deleted",
            description: `${selectedKeys.length} API key(s) have been deleted.`,
        });

        setSelectedKeys([]);
    };

    // Get all keys for filtering and sorting
    const getAllKeys = () => {
        let allKeys: (APIKey & { sectionType: "publishable" | "secret" })[] = [];
        keySections.forEach(section => {
            section.keys.forEach(key => {
                allKeys.push({ ...key, sectionType: section.type });
            });
        });

        // Filter
        if (filter !== "all") {
            allKeys = allKeys.filter(k => k.type === filter);
        }

        // Sort
        allKeys.sort((a, b) => {
            switch (sortBy) {
                case "name-asc":
                    return a.name.localeCompare(b.name);
                case "name-desc":
                    return b.name.localeCompare(a.name);
                case "date-new":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "date-old":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                default:
                    return 0;
            }
        });

        return allKeys;
    };

    const filteredKeys = getAllKeys();

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">API Keys</h1>
                        <p className="text-muted-foreground">
                            Manage your API keys and access tokens securely.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <DatePickerDemo />
                        <Button
                            className="gap-2 bg-primary hover:bg-primary/90"
                            onClick={() => setAddKeyDialogOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Add API Keys
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center justify-between border-b border-border">
                    <div className="flex gap-6">
                        <button className="border-b-2 border-primary pb-3 text-sm font-medium text-foreground">
                            API Keys
                        </button>
                    </div>
                    <div className="flex items-center gap-2 pb-3">
                        {/* Filter Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Filter className="h-4 w-4" />
                                    Filter
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setFilter("all")}>
                                    All Keys
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter("publishable")}>
                                    Publishable Only
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter("secret")}>
                                    Secret Only
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Sort Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <ArrowUpDown className="h-4 w-4" />
                                    Sort by
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSortBy("name-asc")}>
                                    Name (A-Z)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortBy("name-desc")}>
                                    Name (Z-A)
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setSortBy("date-new")}>
                                    Date (Newest)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortBy("date-old")}>
                                    Date (Oldest)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* More Options */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={handleBulkDelete}
                                    className="text-destructive focus:text-destructive"
                                    disabled={selectedKeys.length === 0}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Selected ({selectedKeys.length})
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setSelectedKeys([])}>
                                    Clear Selection
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Key Sections */}
                <div className="space-y-2">
                    {keySections.map((section) => {
                        const sectionKeys = section.keys.filter(key => {
                            if (filter === "all") return true;
                            return key.type === filter;
                        });

                        if (sectionKeys.length === 0 && filter !== "all") return null;

                        return (
                            <Collapsible
                                key={section.id}
                                open={openSections.includes(section.id)}
                                onOpenChange={() => toggleSection(section.id)}
                            >
                                <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-lg bg-muted/30 px-4 py-3 hover:bg-muted/50">
                                    {openSections.includes(section.id) ? (
                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <div
                                        className={cn(
                                            "h-2 w-2 rounded-full",
                                            section.type === "publishable" ? "bg-destructive" : "bg-primary"
                                        )}
                                    />
                                    <span className="font-medium text-foreground">{section.title}</span>
                                    <span className="text-sm text-muted-foreground">({sectionKeys.length})</span>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="space-y-1 pt-1">
                                        {sectionKeys.map((apiKey) => (
                                            <div
                                                key={apiKey.id}
                                                className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 rounded-md"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        checked={selectedKeys.includes(apiKey.id)}
                                                        onCheckedChange={() => toggleKeySelection(apiKey.id)}
                                                    />
                                                    <div>
                                                        <span className="text-sm font-medium text-foreground">{apiKey.name}</span>
                                                        <p className="text-xs text-muted-foreground">
                                                            Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <code className="rounded bg-muted px-3 py-1.5 text-sm text-muted-foreground font-mono">
                                                        {visibleKeys.includes(apiKey.id)
                                                            ? apiKey.key
                                                            : maskKey(apiKey.key)}
                                                    </code>
                                                    {section.type === "secret" && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleKeyVisibility(apiKey.id)}
                                                        >
                                                            {visibleKeys.includes(apiKey.id) ? (
                                                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                            ) : (
                                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                                            )}
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-2"
                                                        onClick={() => copyToClipboard(apiKey.key, apiKey.name)}
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                        Copy
                                                    </Button>

                                                    {/* Three Dots Menu */}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => copyToClipboard(apiKey.key, apiKey.name)}>
                                                                <Copy className="mr-2 h-4 w-4" />
                                                                Copy Key
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => toggleKeyVisibility(apiKey.id)}
                                                                disabled={section.type === "publishable"}
                                                            >
                                                                {visibleKeys.includes(apiKey.id) ? (
                                                                    <>
                                                                        <EyeOff className="mr-2 h-4 w-4" />
                                                                        Hide Key
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        Show Key
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            {apiKey.canDelete && (
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDeleteKey(apiKey.id)}
                                                                    className="text-destructive focus:text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete Key
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        );
                    })}
                </div>

                {/* Add API Key Dialog */}
                <AddAPIKeyDialog
                    open={addKeyDialogOpen}
                    onOpenChange={setAddKeyDialogOpen}
                    onAddKey={handleAddKey}
                />
            </div>
        </DashboardLayout>
    );
}
