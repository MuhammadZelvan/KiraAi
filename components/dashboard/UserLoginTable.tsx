"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Filter, ArrowUpDown, MoreVertical, ChevronLeft, ChevronRight, Trash2, Eye } from "lucide-react";
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

interface UserLogin {
  id: number;
  name: string;
  email: string;
  role: string;
  loginMethod: string;
  firstLogin: string;
  status: "Success" | "Canceled" | "Pending";
  avatar: string;
}

// Generate 50 dummy users
const generateUsers = (): UserLogin[] => {
  const names = [
    "Bahlil Lahadalia", "Siti Nurhaliza", "Ahmad Dhani", "Raisa Andriana", "Atta Halilintar",
    "Raffi Ahmad", "Nagita Slavina", "Deddy Corbuzier", "Ariel Noah", "Luna Maya",
    "Syahrini", "Reino Barack", "Maia Estianty", "Mulan Jameela", "Krisdayanti",
    "Ashanty", "Aurel Hermansyah", "Azriel Hermansyah", "Titi Kamal", "Christian Sugiono",
    "Chelsea Islan", "Dian Sastro", "Nicholas Saputra", "Reza Rahadian", "Iko Uwais",
    "Joe Taslim", "Yayan Ruhian", "Tara Basro", "Marsha Timothy", "Vino G Bastian",
    "Chicco Jerikho", "Rio Dewanto", "Hamish Daud", "Raline Shah", "Cinta Laura",
    "Pevita Pearce", "Adipati Dolken", "Dimas Anggara", "Michelle Ziudith", "Natasha Wilona",
    "Stefan William", "Verrell Bramasta", "Ranty Maria", "Glenca Chysara", "Jefri Nichol",
    "Angga Yunanda", "Shenina Cinnamon", "Emir Mahira", "Anya Geraldine", "Jessica Mila"
  ];

  const emailDomains = ["gmail.com", "yahoo.com", "outlook.com"];
  const roles = ["Admin", "Users", "Moderator", "Editor"];
  const loginMethods = ["Google", "Email", "Apple", "Twitter"];
  const statuses: ("Success" | "Canceled" | "Pending")[] = ["Success", "Canceled", "Pending"];

  return names.map((name, index) => ({
    id: index + 1,
    name,
    email: `${name.toLowerCase().replace(/ /g, '.')}@${emailDomains[index % 3]}`,
    role: roles[Math.floor(Math.random() * roles.length)],
    loginMethod: loginMethods[Math.floor(Math.random() * loginMethods.length)],
    firstLogin: `${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-2025`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
  }));
};

const StatusBadge = ({ status }: { status: UserLogin["status"] }) => {
  const styles = {
    Success: "bg-success/10 text-success",
    Canceled: "bg-destructive/10 text-destructive",
    Pending: "bg-warning/10 text-warning",
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
        styles[status]
      )}
    >
      <span>{icons[status]}</span>
      {status}
    </span>
  );
};

export function UserLoginTable() {
  const [mounted, setMounted] = useState(false);
  const [allUsers, setAllUsers] = useState<UserLogin[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterMethod, setFilterMethod] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("date-desc");
  const [showAll, setShowAll] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const itemsPerPage = 5;

  useEffect(() => {
    setAllUsers(generateUsers());
    setMounted(true);
  }, []);

  // Filter and search
  const filteredUsers = useMemo(() => {
    let filtered = allUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus.length === 0 || filterStatus.includes(user.status);
      const matchesMethod = filterMethod.length === 0 || filterMethod.includes(user.loginMethod);

      return matchesSearch && matchesStatus && matchesMethod;
    });

    // Sort
    switch (sortBy) {
      case "date-desc":
        filtered.sort((a, b) => {
          const dateA = new Date(a.firstLogin.split('-').reverse().join('-'));
          const dateB = new Date(b.firstLogin.split('-').reverse().join('-'));
          return dateB.getTime() - dateA.getTime();
        });
        break;
      case "date-asc":
        filtered.sort((a, b) => {
          const dateA = new Date(a.firstLogin.split('-').reverse().join('-'));
          const dateB = new Date(b.firstLogin.split('-').reverse().join('-'));
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return filtered;
  }, [allUsers, searchQuery, filterStatus, filterMethod, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const displayedUsers = showAll
    ? filteredUsers
    : filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(displayedUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  // Handle select individual user
  const handleSelectUser = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, id]);
    } else {
      setSelectedUsers(selectedUsers.filter(uid => uid !== id));
    }
  };


  if (!mounted) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border p-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">User Login</h3>
            <p className="text-sm text-muted-foreground">AI chatbot login records</p>
          </div>
        </div>
        <div className="p-12 text-center text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border p-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">User Login</h3>
          <p className="text-sm text-muted-foreground">AI chatbot login records</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-48 rounded-lg border-border bg-background pl-9 text-sm"
            />
          </div>

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 border-border">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filterStatus.includes("Success")}
                onCheckedChange={(checked) => {
                  setFilterStatus(checked
                    ? [...filterStatus, "Success"]
                    : filterStatus.filter(s => s !== "Success")
                  );
                }}
              >
                Success
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterStatus.includes("Pending")}
                onCheckedChange={(checked) => {
                  setFilterStatus(checked
                    ? [...filterStatus, "Pending"]
                    : filterStatus.filter(s => s !== "Pending")
                  );
                }}
              >
                Pending
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterStatus.includes("Canceled")}
                onCheckedChange={(checked) => {
                  setFilterStatus(checked
                    ? [...filterStatus, "Canceled"]
                    : filterStatus.filter(s => s !== "Canceled")
                  );
                }}
              >
                Canceled
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Method</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filterMethod.includes("Google")}
                onCheckedChange={(checked) => {
                  setFilterMethod(checked
                    ? [...filterMethod, "Google"]
                    : filterMethod.filter(m => m !== "Google")
                  );
                }}
              >
                Google
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterMethod.includes("Email")}
                onCheckedChange={(checked) => {
                  setFilterMethod(checked
                    ? [...filterMethod, "Email"]
                    : filterMethod.filter(m => m !== "Email")
                  );
                }}
              >
                Email
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterMethod.includes("Apple")}
                onCheckedChange={(checked) => {
                  setFilterMethod(checked
                    ? [...filterMethod, "Apple"]
                    : filterMethod.filter(m => m !== "Apple")
                  );
                }}
              >
                Apple
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterMethod.includes("Twitter")}
                onCheckedChange={(checked) => {
                  setFilterMethod(checked
                    ? [...filterMethod, "Twitter"]
                    : filterMethod.filter(m => m !== "Twitter")
                  );
                }}
              >
                Twitter
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort By Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 border-border">
                <ArrowUpDown className="h-4 w-4" />
                Sort by
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
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name-desc")}>
                Name (Z-A)
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
                  className="border-border"
                  checked={selectedUsers.length === displayedUsers.length && displayedUsers.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                User Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                Role
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                Login Method
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                First Login
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {displayedUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/30"
              >
                <td className="px-6 py-4">
                  <Checkbox
                    className="border-border"
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {user.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">
                      {user.name}
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
                  {user.firstLogin}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-6 py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete User
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 border-border text-muted-foreground"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || showAll}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          {!showAll && (
            <div className="flex items-center gap-1">
              {[...Array(Math.min(totalPages, 10))].map((_, i) => {
                const pageNum = i + 1;
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "outline" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "h-8 w-8 p-0",
                        currentPage === pageNum
                          ? "border-border bg-card font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      {pageNum}
                    </Button>
                  );
                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} className="px-2 text-muted-foreground">...</span>;
                }
                return null;
              })}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-1 border-border"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || showAll}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            Displaying Transactions {showAll ? `1-${filteredUsers.length}` : `${((currentPage - 1) * itemsPerPage) + 1}-${Math.min(currentPage * itemsPerPage, filteredUsers.length)}`} of {filteredUsers.length}
          </span>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-foreground"
            onClick={() => {
              setShowAll(!showAll);
              setCurrentPage(1);
            }}
          >
            {showAll ? "Show Paginated" : "Show All"}
          </Button>
        </div>
      </div>
    </div>
  );
}
