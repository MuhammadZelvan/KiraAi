"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  List,
  LayoutGrid,
  Table as TableIcon,
  SlidersHorizontal,
  ArrowUpDown,
  MoreVertical,
  Ban,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  totalChats: number;
  tokensUsed: string;
  lastActive: string;
  joinDate: string;
  status: "Active" | "Banned";
  role?: "user" | "admin";
}

type ViewMode = "list" | "table" | "grid";
type FilterType = "all" | "active" | "banned";
type SortType = "name-asc" | "name-desc" | "email-asc" | "email-desc" | "date-new" | "date-old";

interface UserManageTableProps {
  users: User[];
  onBanUser: (userId: string) => void;
  onUnbanUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

export function UserManageTable({ users, onBanUser, onUnbanUser, onDeleteUser }: UserManageTableProps) {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("name-asc");

  // Filter users
  let filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "active" && user.status === "Active") ||
      (filter === "banned" && user.status === "Banned");

    return matchesSearch && matchesFilter;
  });

  // Sort users
  filteredUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "email-asc":
        return a.email.localeCompare(b.email);
      case "email-desc":
        return b.email.localeCompare(a.email);
      case "date-new":
        return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
      case "date-old":
        return new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
      default:
        return 0;
    }
  });

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  const handleBanUser = (userId: string) => {
    onBanUser(userId);
    toast({
      title: "User Banned",
      description: "User has been banned successfully.",
    });
  };

  const handleUnbanUser = (userId: string) => {
    onUnbanUser(userId);
    toast({
      title: "User Unbanned",
      description: "User has been unbanned successfully.",
    });
  };

  const handleDeleteUser = (userId: string) => {
    onDeleteUser(userId);
    toast({
      title: "User Deleted",
      description: "User has been deleted successfully.",
      variant: "destructive",
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Controls */}
      <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* View Mode Toggle */}
        <div className="flex rounded-lg border border-border bg-background p-1">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              viewMode === "list"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-4 w-4" />
            List
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              viewMode === "table"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <TableIcon className="h-4 w-4" />
            Table
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              viewMode === "grid"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Grid
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by email or username"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-9"
            />
          </div>

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter("all")}>
                All Users
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("active")}>
                Active Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("banned")}>
                Banned Only
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
              <DropdownMenuItem onClick={() => setSortBy("email-asc")}>
                Email (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("email-desc")}>
                Email (Z-A)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy("date-new")}>
                Join Date (Newest)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("date-old")}>
                Join Date (Oldest)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* View Content */}
      {viewMode === "table" && (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>User Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Total Chats</TableHead>
              <TableHead className="text-center">Tokens Used</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => toggleUserSelection(user.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell className="text-center">{user.totalChats}</TableCell>
                <TableCell className="text-center">{user.tokensUsed}</TableCell>
                <TableCell className="text-muted-foreground">
                  {user.lastActive}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                      user.status === "Active"
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        user.status === "Active" ? "bg-success" : "bg-destructive"
                      )}
                    />
                    {user.status}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user.status === "Active" ? (
                        <DropdownMenuItem
                          onClick={() => handleBanUser(user.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Ban User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleUnbanUser(user.id)}
                          className="text-success focus:text-success"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Unban User
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="divide-y divide-border">
          {filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
              <Checkbox
                checked={selectedUsers.includes(user.id)}
                onCheckedChange={() => toggleUserSelection(user.id)}
              />
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                  user.status === "Active"
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    user.status === "Active" ? "bg-success" : "bg-destructive"
                  )}
                />
                {user.status}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user.status === "Active" ? (
                    <DropdownMenuItem
                      onClick={() => handleBanUser(user.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Ban User
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => handleUnbanUser(user.id)}
                      className="text-success focus:text-success"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Unban User
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="relative rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow"
            >
              <div className="absolute top-4 left-4">
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={() => toggleUserSelection(user.id)}
                />
              </div>
              <div className="absolute top-4 right-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {user.status === "Active" ? (
                      <DropdownMenuItem
                        onClick={() => handleBanUser(user.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Ban User
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => handleUnbanUser(user.id)}
                        className="text-success focus:text-success"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Unban User
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex flex-col items-center gap-3 pt-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                    user.status === "Active"
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      user.status === "Active" ? "bg-success" : "bg-destructive"
                    )}
                  />
                  {user.status}
                </span>
                <div className="grid grid-cols-2 gap-4 w-full pt-2 border-t border-border text-center text-sm">
                  <div>
                    <div className="font-semibold">{user.totalChats}</div>
                    <div className="text-xs text-muted-foreground">Chats</div>
                  </div>
                  <div>
                    <div className="font-semibold">{user.tokensUsed}</div>
                    <div className="text-xs text-muted-foreground">Tokens</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
