"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, ChevronRight, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

type User = { id: string; name: string; email: string; password?: string; role?: string; status?: string; };

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Get users from localStorage
        const usersData = typeof window !== 'undefined'
            ? localStorage.getItem('kiraai_users')
            : null;

        const users: User[] = usersData ? JSON.parse(usersData) : [];

        // Find user by email
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        // Validation
        if (!user) {
            toast({
                title: "Account Not Found",
                description: "No account found with this email. Please check your email or create a new account.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        // Check if banned
        if (user.status === "Banned") {
            toast({
                title: "Account Banned",
                description: "Your account has been banned. Please contact support for assistance.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        // Check password (in production, this would be hashed)
        if (!password) {
            toast({
                title: "Password Required",
                description: "Please enter your password.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        // Save current user to localStorage
        localStorage.setItem('kiraai_current_user', JSON.stringify(user));

        // Success
        toast({
            title: "Login Successful",
            description: `Welcome back, ${user.name}!`,
        });

        // Navigate based on role
        setTimeout(() => {
            if (user.role === "admin") {
                router.push("/analytics");
            } else {
                router.push("/chat");
            }
        }, 500);
    };

    const handleOAuthLogin = (provider: string) => {
        console.log(`Login with ${provider}`);
        toast({
            title: "OAuth Login",
            description: `${provider} login will be implemented soon.`,
        });
    };

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/")}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to website
                </Button>
                <Button variant="ghost" size="icon">
                    <LifeBuoy className="h-5 w-5 text-muted-foreground" />
                </Button>
            </header>

            {/* Login Card */}
            <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
                <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
                    {/* Logo */}
                    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-foreground">
                        <span className="text-lg font-bold text-background">K</span>
                    </div>

                    {/* Title */}
                    <h1 className="mb-1 text-2xl font-semibold text-foreground">
                        Sign in to KiraAi
                    </h1>
                    <p className="mb-6 text-sm text-muted-foreground">
                        Trusted by +50,000 professionals world wide.
                    </p>

                    {/* OAuth Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => handleOAuthLogin("google")}
                            className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>

                        <button
                            onClick={() => handleOAuthLogin("apple")}
                            className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                </svg>
                                Continue with Apple
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>

                        <button
                            onClick={() => handleOAuthLogin("twitter")}
                            className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                Continue with X (Twitter)
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-xs text-muted-foreground">OR WITH</span>
                        <div className="h-px flex-1 bg-border" />
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm text-muted-foreground">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm text-muted-foreground">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Forgot your password?
                            </button>
                            <Button type="submit" className="px-8">
                                Login
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Sign up link */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <button className="font-medium text-foreground underline underline-offset-4 hover:text-primary">
                            Sign up now!
                        </button>
                    </p>
                    <p className="mt-4 text-xs text-muted-foreground">
                        By continuing, you agree to Langbase's Terms of Service and
                        <br />
                        Privacy Policy, and to receive periodic emails with updates.
                    </p>
                </div>
            </div>
        </div>
    );
}
