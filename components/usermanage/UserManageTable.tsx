"use client";

import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Ban, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface UserManageTableProps {
  users: User[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  search: string;
  status: "all" | "active" | "banned";
  onSearchChange: (v: string) => void;
  onStatusChange: (v: "all" | "active" | "banned") => void;
  onPageChange: (p: number) => void;
  onBanUser: (id: string) => void;
  onUnbanUser: (id: string) => void;
  onDeleteUser: (id: string) => void;
  onBulkBan: (ids: string[]) => void;
  onBulkUnban: (ids: string[]) => void;
  onBulkDelete: (ids: string[]) => void;
}

export function UserManageTable({
  users, total, page, limit, loading, search, status,
  onSearchChange, onStatusChange, onPageChange,
  onBanUser, onUnbanUser, onDeleteUser,
  onBulkBan, onBulkUnban, onBulkDelete,
}: UserManageTableProps) {
  const totalPages = Math.ceil(total / limit);
  const [selected, setSelected] = useState<string[]>([]);

  const allSelected = users.length > 0 && selected.length === users.length;
  const someSelected = selected.length > 0;

  const toggleAll = () => setSelected(allSelected ? [] : users.map((u) => u.id));
  const toggleOne = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const clearSelection = () => setSelected([]);

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Controls */}
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-lg border border-border bg-background p-1 text-xs">
          {(["all", "active", "banned"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { onStatusChange(f); clearSelection(); }}
              className={cn(
                "rounded-md px-4 py-2 font-medium capitalize transition-colors",
                status === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "all" ? "All Users" : f === "active" ? "Active" : "Banned"}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email or name"
            value={search}
            onChange={(e) => { onSearchChange(e.target.value); clearSelection(); }}
            className="w-64 pl-9"
          />
        </div>
      </div>

      {/* Bulk Action Bar */}
      {someSelected && (
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
          <p className="text-sm font-medium">
            {selected.length} user{selected.length > 1 ? "s" : ""} selected
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm" className="h-7 gap-1.5 text-xs"
              onClick={() => { onBulkBan(selected); clearSelection(); }}
            >
              <Ban className="h-3.5 w-3.5" />
              Ban
            </Button>
            <Button
              variant="outline" size="sm"
              className="h-7 gap-1.5 text-xs text-success border-success/30 hover:bg-success/10 hover:text-success"
              onClick={() => { onBulkUnban(selected); clearSelection(); }}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Unban
            </Button>
            <Button
              variant="outline" size="sm"
              className="h-7 gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => { onBulkDelete(selected); clearSelection(); }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
            <button
              onClick={clearSelection}
              className="text-xs text-muted-foreground hover:text-foreground ml-1"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
            </TableHead>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-center">Chats</TableHead>
            <TableHead className="text-center">Tokens</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} className="py-10 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="py-10 text-center text-muted-foreground text-sm">
                No users found.
              </TableCell>
            </TableRow>
          ) : users.map((user) => (
            <TableRow key={user.id} className={cn(selected.includes(user.id) && "bg-muted/30")}>
              <TableCell>
                <Checkbox
                  checked={selected.includes(user.id)}
                  onCheckedChange={() => toggleOne(user.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm leading-none">{user.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  user.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {user.role ?? "user"}
                </span>
              </TableCell>
              <TableCell className="text-center">{user.totalChats}</TableCell>
              <TableCell className="text-center font-mono text-sm">{user.tokensUsed}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{user.lastActive}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{user.joinDate}</TableCell>
              <TableCell>
                <span className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                  user.status === "Active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                )}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", user.status === "Active" ? "bg-success" : "bg-destructive")} />
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
                      <DropdownMenuItem onClick={() => onBanUser(user.id)} className="text-destructive focus:text-destructive">
                        <Ban className="mr-2 h-4 w-4" /> Ban User
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => onUnbanUser(user.id)} className="text-success focus:text-success">
                        <CheckCircle className="mr-2 h-4 w-4" /> Unban User
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDeleteUser(user.id)} className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Showing {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} users
        </p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs"
            onClick={() => { onPageChange(Math.max(1, page - 1)); clearSelection(); }}
            disabled={page === 1}>
            ← Prev
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <Button key={p} variant={p === page ? "default" : "ghost"} size="sm"
              className={cn("h-7 w-7 p-0 text-xs", p === page && "bg-primary text-primary-foreground")}
              onClick={() => { onPageChange(p); clearSelection(); }}>
              {p}
            </Button>
          ))}
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs"
            onClick={() => { onPageChange(Math.min(totalPages, page + 1)); clearSelection(); }}
            disabled={page === totalPages || totalPages === 0}>
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
}