"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import type { User } from "./UserManageTable";

interface AddUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddUser: (user: User) => void;
}

export function AddUserDialog({ open, onOpenChange, onAddUser }: AddUserDialogProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        adminToken: "",
        role: "user" as "user" | "admin",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        if (!formData.username || !formData.email || !formData.password) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        // Validate admin token if role is admin
        if (formData.role === "admin" && !formData.adminToken) {
            toast({
                title: "Validation Error",
                description: "Admin token is required for admin users.",
                variant: "destructive",
            });
            return;
        }

        // Create new user object
        const newUser: User = {
            id: Date.now().toString(),
            name: formData.username,
            email: formData.email,
            avatar: "",
            totalChats: 0,
            tokensUsed: "0",
            lastActive: "Just now",
            joinDate: new Date().toISOString().split('T')[0],
            status: "Active",
            role: formData.role,
        };

        // Call parent handler
        onAddUser(newUser);

        // Reset form and close
        setFormData({ username: "", email: "", password: "", adminToken: "", role: "user" });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                        Create a new user account. Fill in the details below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">
                                Username <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="username"
                                placeholder="Enter username"
                                value={formData.username}
                                onChange={(e) =>
                                    setFormData({ ...formData, username: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">
                                Email <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="user@example.com"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">
                                Password <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter password"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value: "user" | "admin") =>
                                    setFormData({ ...formData, role: value })
                                }
                            >
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {formData.role === "admin" && (
                            <div className="grid gap-2">
                                <Label htmlFor="adminToken">
                                    Admin Token <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="adminToken"
                                    type="password"
                                    placeholder="Enter admin access token"
                                    value={formData.adminToken}
                                    onChange={(e) =>
                                        setFormData({ ...formData, adminToken: e.target.value })
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Special token required for admin access
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">Create User</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
