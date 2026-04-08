"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserStatCard } from "@/components/usermanage/UserStatCard";
import { UserManageTable, type User } from "@/components/usermanage/UserManageTable";
import { AddUserDialog } from "@/components/usermanage/AddUserDialog";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, UserX, MessageCircle, Upload, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  getUserMetrics,
  getUsers,
  banUser,
  unbanUser,
  deleteUser,
  createUser,
} from "@/lib/adminApi";
import { useAutoRefresh } from "@/hooks/use-autorefresh";

interface Metrics {
  total_users: number;
  active_users: number;
  banned_users: number;
  total_chat_users: number;
}

export default function UsersPage() {
  const { toast } = useToast();

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "banned">("all");
  const [loading, setLoading] = useState(true);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);

  const limit = 10;

  const fetchMetrics = async () => {
    try {
      const data = await getUserMetrics();
      setMetrics(data);
    } catch {
      console.error("Failed to load metrics");
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers({ page, limit, search, status });
      setUsers(
        data.data.map((u: any) => ({
          id: u.id,
          name: u.name || u.username || u.email,
          email: u.email,
          avatar: "",
          totalChats: u.total_chats,
          tokensUsed: u.tokens_used >= 1000
            ? `${(u.tokens_used / 1000).toFixed(1)}K`
            : String(u.tokens_used),
          lastActive: u.last_active
            ? new Date(u.last_active).toLocaleDateString()
            : "Never",
          joinDate: new Date(u.created_at).toISOString().split("T")[0],
          status: u.status === "banned" ? "Banned" : "Active",
          role: u.role,
        }))
      );
      setTotal(data.total);
    } catch {
      toast({ title: "Failed to load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useAutoRefresh(fetchUsers);

  const handleExport = async () => {
    try {
      const data = await getUsers({ page: 1, limit: 9999, search, status });
      const rows = [
        ["Name", "Email", "Role", "Total Chats", "Tokens Used", "Status", "Join Date"],
        ...data.data.map((u: any) => [
          u.name || u.username || u.email,
          u.email,
          u.role,
          u.total_chats,
          u.tokens_used,
          u.status,
          new Date(u.created_at).toLocaleDateString(),
        ]),
      ];
      const csv = rows.map((r: any[]) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export Successful", description: "User data exported to CSV." });
    } catch {
      toast({ title: "Export Failed", variant: "destructive" });
    }
  };

  const handleAddUser = async (formData: {
    username: string;
    email: string;
    password: string;
    role: "user" | "admin";
  }) => {
    try {
      await createUser(formData);
      toast({ title: "User Created", description: `${formData.username} has been created.` });
      setAddUserDialogOpen(false);
      fetchUsers();
      fetchMetrics();
    } catch {
      toast({ title: "Failed to create user", variant: "destructive" });
    }
  };

  const handleBanUser = async (userId: string) => {
    try {
      await banUser(userId);
      toast({ title: "User Banned" });
      fetchUsers();
      fetchMetrics();
    } catch {
      toast({ title: "Failed to ban user", variant: "destructive" });
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await unbanUser(userId);
      toast({ title: "User Unbanned" });
      fetchUsers();
      fetchMetrics();
    } catch {
      toast({ title: "Failed to unban user", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast({ title: "User Deleted", variant: "destructive" });
      fetchUsers();
      fetchMetrics();
    } catch {
      toast({ title: "Failed to delete user", variant: "destructive" });
    }
  };

  const handleBulkBan = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => banUser(id)));
      toast({ title: `${ids.length} user(s) banned` });
      fetchUsers();
      fetchMetrics();
    } catch {
      toast({ title: 'Bulk ban failed', variant: 'destructive' });
    }
  };

  const handleBulkUnban = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => unbanUser(id)));
      toast({ title: `${ids.length} user(s) unbanned` });
      fetchUsers();
      fetchMetrics();
    } catch {
      toast({ title: 'Bulk unban failed', variant: 'destructive' });
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => deleteUser(id)));
      toast({ title: `${ids.length} user(s) deleted`, variant: 'destructive' });
      fetchUsers();
      fetchMetrics();
    } catch {
      toast({ title: 'Bulk delete failed', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage and monitor all users in your system.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Upload className="h-4 w-4" />
              Export Data
            </Button>
            <Button
              className="gap-2 bg-primary hover:bg-primary/90"
              onClick={() => setAddUserDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <UserStatCard
            title="Total Users"
            value={metrics ? String(metrics.total_users) : "—"}
            change={metrics ? `${metrics.total_users} total` : "—"}
            changeType="neutral"
            icon={<Users className="h-6 w-6 text-primary" />}
            iconBgColor="bg-primary/10"
          />
          <UserStatCard
            title="Active Users"
            value={metrics ? String(metrics.active_users) : "—"}
            change={metrics
              ? `${Math.round((metrics.active_users / metrics.total_users) * 100) || 0}% of total`
              : "—"}
            changeType="positive"
            icon={<UserCheck className="h-6 w-6 text-success" />}
            iconBgColor="bg-success/10"
          />
          <UserStatCard
            title="Banned Users"
            value={metrics ? String(metrics.banned_users) : "—"}
            change={metrics
              ? `${Math.round((metrics.banned_users / metrics.total_users) * 100) || 0}% of total`
              : "—"}
            changeType="negative"
            icon={<UserX className="h-6 w-6 text-destructive" />}
            iconBgColor="bg-destructive/10"
          />
          <UserStatCard
            title="Users With Chats"
            value={metrics ? String(metrics.total_chat_users) : "—"}
            change={metrics
              ? `${Math.round((metrics.total_chat_users / metrics.total_users) * 100) || 0}% of total`
              : "—"}
            changeType="positive"
            icon={<MessageCircle className="h-6 w-6 text-warning" />}
            iconBgColor="bg-warning/10"
          />
        </div>

        {/* Table */}
        <UserManageTable
          users={users}
          total={total}
          page={page}
          limit={limit}
          loading={loading}
          search={search}
          status={status}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          onStatusChange={(v) => { setStatus(v); setPage(1); }}
          onPageChange={setPage}
          onBanUser={handleBanUser}
          onUnbanUser={handleUnbanUser}
          onDeleteUser={handleDeleteUser}
          onBulkBan={handleBulkBan}
          onBulkUnban={handleBulkUnban}
          onBulkDelete={handleBulkDelete}
        />

        <AddUserDialog
          open={addUserDialogOpen}
          onOpenChange={setAddUserDialogOpen}
          onAddUser={handleAddUser}
        />
      </div>
    </DashboardLayout>
  );
}