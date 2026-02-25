// Authentication utilities and user storage
// In production, this would be replaced with actual API calls

import type { User } from "@/components/usermanage/UserManageTable";

// Storage keys
const USERS_STORAGE_KEY = "kiraai_users";
const CURRENT_USER_KEY = "kiraai_current_user";

// Get all users from storage
export function getStoredUsers(): User[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Save users to storage
export function saveUsers(users: User[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Get current logged in user
export function getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
}

// Set current user
export function setCurrentUser(user: User | null) {
    if (typeof window === "undefined") return;
    if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(CURRENT_USER_KEY);
    }
}

// Logout
export function logout() {
    setCurrentUser(null);
}

// Login validation
export interface LoginResult {
    success: boolean;
    message: string;
    user?: User;
}

export function validateLogin(email: string, password: string): LoginResult {
    const users = getStoredUsers();

    // Find user by email
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        return {
            success: false,
            message: "Account not found. Please check your email or create a new account.",
        };
    }

    // Check if user is banned
    if (user.status === "Banned") {
        return {
            success: false,
            message: "Your account has been banned. Please contact support for assistance.",
        };
    }

    // In production, validate password hash
    // For now, we just check if password is not empty
    if (!password) {
        return {
            success: false,
            message: "Please enter your password.",
        };
    }

    // Login successful
    return {
        success: true,
        message: "Login successful!",
        user,
    };
}

// Check if email is already registered
export function isEmailRegistered(email: string): boolean {
    const users = getStoredUsers();
    return users.some(u => u.email.toLowerCase() === email.toLowerCase());
}

// Register new user (from admin panel)
export function registerUser(user: User) {
    const users = getStoredUsers();
    users.push(user);
    saveUsers(users);
}

// Update user status (ban/unban)
export function updateUserStatus(userId: string, status: "Active" | "Banned") {
    const users = getStoredUsers();
    const updatedUsers = users.map(u =>
        u.id === userId ? { ...u, status } : u
    );
    saveUsers(updatedUsers);
}

// Delete user
export function deleteUser(userId: string) {
    const users = getStoredUsers();
    const updatedUsers = users.filter(u => u.id !== userId);
    saveUsers(updatedUsers);
}
