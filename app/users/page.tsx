"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserStatCard } from "@/components/usermanage/UserStatCard";
import { UserManageTable, type User } from "@/components/usermanage/UserManageTable";
import { AddUserDialog } from "@/components/usermanage/AddUserDialog";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, UserX, MessageCircle, Upload, Plus } from "lucide-react";
import { exportUsersToCSV } from "@/lib/userExportUtils";
import { useToast } from "@/components/ui/use-toast";

// Initial mock data
const initialUsers: User[] = [
    { id: "1", name: "Bahlil Lahadalia", email: "bahlil@gmail.com", avatar: "", totalChats: 128, tokensUsed: "24.3K", lastActive: "2 hours ago", joinDate: "2024-01-15", status: "Active", role: "user" },
    { id: "2", name: "Olivia Anderson", email: "olivia.anderson@gmail.com", avatar: "", totalChats: 95, tokensUsed: "18.2K", lastActive: "5 hours ago", joinDate: "2024-02-20", status: "Active", role: "user" },
    { id: "3", name: "John Doe", email: "john.doe@example.com", avatar: "", totalChats: 45, tokensUsed: "8.5K", lastActive: "1 day ago", joinDate: "2024-03-10", status: "Banned", role: "user" },
    { id: "4", name: "Sarah Wilson", email: "sarah.w@gmail.com", avatar: "", totalChats: 210, tokensUsed: "42.1K", lastActive: "30 mins ago", joinDate: "2023-12-05", status: "Banned", role: "user" },
    { id: "5", name: "Michael Chen", email: "m.chen@outlook.com", avatar: "", totalChats: 156, tokensUsed: "29.7K", lastActive: "3 hours ago", joinDate: "2024-01-28", status: "Active", role: "user" },
    { id: "6", name: "Emma Davis", email: "emma.davis@yahoo.com", avatar: "", totalChats: 78, tokensUsed: "15.3K", lastActive: "6 hours ago", joinDate: "2024-02-14", status: "Active", role: "user" },
    { id: "7", name: "David Martinez", email: "david.m@gmail.com", avatar: "", totalChats: 189, tokensUsed: "35.8K", lastActive: "1 hour ago", joinDate: "2024-01-05", status: "Active", role: "user" },
    { id: "8", name: "Lisa Thompson", email: "lisa.t@example.com", avatar: "", totalChats: 34, tokensUsed: "6.2K", lastActive: "2 days ago", joinDate: "2024-03-22", status: "Banned", role: "user" },
    { id: "9", name: "James Brown", email: "james.brown@gmail.com", avatar: "", totalChats: 167, tokensUsed: "31.4K", lastActive: "4 hours ago", joinDate: "2024-01-18", status: "Active", role: "user" },
    { id: "10", name: "Sophie Taylor", email: "sophie.taylor@outlook.com", avatar: "", totalChats: 92, tokensUsed: "17.6K", lastActive: "8 hours ago", joinDate: "2024-02-28", status: "Banned", role: "user" },
];

export default function UsersPage() {
    const { toast } = useToast();

    // Initialize from localStorage or use initial data
    const [users, setUsers] = useState<User[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('kiraai_users');
            if (saved) {
                return JSON.parse(saved);
            }
        }
        return initialUsers;
    });

    const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);

    // Sync to localStorage whenever users change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('kiraai_users', JSON.stringify(users));
        }
    }, [users]);

    // Calculate stats
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === "Active").length;
    const bannedUsers = users.filter(u => u.status === "Banned").length;

    const handleExportUsers = () => {
        try {
            exportUsersToCSV(users);
            toast({
                title: "Export Successful",
                description: "User data has been exported to CSV file.",
            });
        } catch (error) {
            toast({
                title: "Export Failed",
                description: "Failed to export user data. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleAddUser = (newUser: User) => {
        // Check if email already exists
        if (users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
            toast({
                title: "Email Already Exists",
                description: "A user with this email already exists.",
                variant: "destructive",
            });
            return;
        }

        setUsers([newUser, ...users]);

        toast({
            title: "User Created",
            description: `${newUser.role === "admin" ? "Admin" : "User"} ${newUser.name} has been created successfully.`,
        });
    };

    const handleBanUser = (userId: string) => {
        setUsers(users.map(user =>
            user.id === userId ? { ...user, status: "Banned" as const } : user
        ));
    };

    const handleUnbanUser = (userId: string) => {
        setUsers(users.map(user =>
            user.id === userId ? { ...user, status: "Active" as const } : user
        ));
    };

    const handleDeleteUser = (userId: string) => {
        setUsers(users.filter(user => user.id !== userId));
    };

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
                        <p className="text-muted-foreground">
                            Manage and monitor all users in your system.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2" onClick={handleExportUsers}>
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

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <UserStatCard
                        title="Total Users"
                        value={totalUsers.toString()}
                        change={`${totalUsers} users`}
                        changeType="neutral"
                        icon={<Users className="h-6 w-6 text-primary" />}
                        iconBgColor="bg-primary/10"
                    />
                    <UserStatCard
                        title="Active Users"
                        value={activeUsers.toString()}
                        change={`${Math.round((activeUsers / totalUsers) * 100)}%`}
                        changeType="positive"
                        icon={<UserCheck className="h-6 w-6 text-success" />}
                        iconBgColor="bg-success/10"
                    />
                    <UserStatCard
                        title="Banned Users"
                        value={bannedUsers.toString()}
                        change={`${Math.round((bannedUsers / totalUsers) * 100)}%`}
                        changeType="negative"
                        icon={<UserX className="h-6 w-6 text-destructive" />}
                        iconBgColor="bg-destructive/10"
                    />
                    <UserStatCard
                        title="Total Chats Users"
                        value={users.filter(u => u.totalChats > 0).length.toString()}
                        change="↑ 5%"
                        changeType="positive"
                        icon={<MessageCircle className="h-6 w-6 text-warning" />}
                        iconBgColor="bg-warning/10"
                    />
                </div>

                {/* Table */}
                <UserManageTable
                    users={users}
                    onBanUser={handleBanUser}
                    onUnbanUser={handleUnbanUser}
                    onDeleteUser={handleDeleteUser}
                />

                {/* Add User Dialog */}
                <AddUserDialog
                    open={addUserDialogOpen}
                    onOpenChange={setAddUserDialogOpen}
                    onAddUser={handleAddUser}
                />
            </div>
        </DashboardLayout>
    );
}
