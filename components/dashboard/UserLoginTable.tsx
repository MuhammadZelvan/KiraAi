"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

import { getLoginActivity } from "@/lib/adminApi";

export interface UserLogin {
  id: string;
  email: string;
  role: string;
  loginMethod: string;
  firstLogin: string | null;
  status: "Success" | "Canceled" | "Pending";
}

interface Props {
  data: UserLogin[];
}

const StatusBadge = ({ status }: { status: UserLogin["status"] }) => {
  const styles = {
    Success: "bg-green-500/10 text-green-600",
    Canceled: "bg-red-500/10 text-red-600",
    Pending: "bg-yellow-500/10 text-yellow-600",
  };

  const icons = {
    Success: "✓",
    Canceled: "✕",
    Pending: "⏳",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        styles[status],
      )}
    >
      <span>{icons[status]}</span>
      {status}
    </span>
  );
};

export function UserLoginTable({ data }: Props) {
  const [mounted, setMounted] = useState(false);
  const [allUsers, setAllUsers] = useState<UserLogin[]>(data);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterMethod, setFilterMethod] = useState<string[]>([]);

  const [sortBy, setSortBy] = useState("date-desc");

  const [showAll, setShowAll] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterMethod]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setAllUsers(data);
  }, [data]);

  const filteredUsers = useMemo(() => {
    let filtered = allUsers.filter((user) => {
      const matchesSearch =
        (user.email ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterStatus.length === 0 || filterStatus.includes(user.status);

      const matchesMethod =
        filterMethod.length === 0 ||
        filterMethod.some(
          (m) => m.toLowerCase() === user.loginMethod.toLowerCase(),
        );

      return matchesSearch && matchesStatus && matchesMethod;
    });

    switch (sortBy) {
      case "date-desc":
        filtered.sort(
          (a, b) =>
            new Date(b.firstLogin ?? 0).getTime() -
            new Date(a.firstLogin ?? 0).getTime(),
        );
        break;

      case "date-asc":
        filtered.sort(
          (a, b) =>
            new Date(a.firstLogin ?? 0).getTime() -
            new Date(b.firstLogin ?? 0).getTime(),
        );
        break;

      case "name-asc":
        filtered.sort((a, b) => a.email.localeCompare(b.email));
        break;

      case "name-desc":
        filtered.sort((a, b) => b.email.localeCompare(a.email));
        break;
    }

    return filtered;
  }, [allUsers, searchQuery, filterStatus, filterMethod, sortBy]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const displayedUsers = showAll
    ? filteredUsers
    : filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(displayedUsers.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, id]);
    } else {
      setSelectedUsers(selectedUsers.filter((uid) => uid !== id));
    }
  };

  if (!mounted) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="p-12 text-center text-muted-foreground">
          Loading login activity...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border p-6">
        <div>
          <h3 className="text-lg font-semibold">User Login</h3>
          <p className="text-sm text-muted-foreground">
            AI chatbot login records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-48 pl-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Status</DropdownMenuLabel>

              {["Success", "Pending", "Canceled"].map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={filterStatus.includes(status)}
                  onCheckedChange={(checked) => {
                    setFilterStatus(
                      checked
                        ? [...filterStatus, status]
                        : filterStatus.filter((s) => s !== status),
                    );
                  }}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Login Method</DropdownMenuLabel>

              {["Google", "Email", "Apple", "Twitter"].map((method) => (
                <DropdownMenuCheckboxItem
                  key={method}
                  checked={filterMethod.includes(method)}
                  onCheckedChange={(checked) => {
                    setFilterMethod(
                      checked
                        ? [...filterMethod, method]
                        : filterMethod.filter((m) => m !== method),
                    );
                  }}
                >
                  {method}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("date-desc")}>
                Newest First
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setSortBy("date-asc")}>
                Oldest First
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setSortBy("name-asc")}>
                Email A-Z
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setSortBy("name-desc")}>
                Email Z-A
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-left">
                <Checkbox
                  checked={
                    selectedUsers.length === displayedUsers.length &&
                    displayedUsers.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </th>

              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                User
              </th>

              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                Email
              </th>

              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                Role
              </th>

              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                Method
              </th>

              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                First Login
              </th>

              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                Status
              </th>

              <th className="px-6 py-4"></th>
            </tr>
          </thead>

          <tbody>
            {displayedUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-border hover:bg-muted/30"
              >
                <td className="px-6 py-4">
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) =>
                      handleSelectUser(user.id, checked as boolean)
                    }
                  />
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                      />
                      <AvatarFallback>
                        {user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <span className="text-sm font-medium">
                      {user.email.split("@")[0]}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {user.email}
                </td>

                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {user.role}
                </td>

                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {user.loginMethod}
                </td>

                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {user.firstLogin
                    ? new Date(user.firstLogin).toLocaleDateString()
                    : "-"}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={user.status} />
                </td>

                <td className="px-6 py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-8 w-8 items-center justify-center rounded hover:bg-muted">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>

                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Log
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-6 py-4">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1 || showAll}
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages || showAll}
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
