"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
import { login } from "@/lib/api";

const API_URL = "http://localhost:4000";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess?: (name: string, email: string) => void;
  initialMode?: "signin" | "signup";
}

export function LoginDialog({
  open,
  onOpenChange,
  onLoginSuccess,
  initialMode = "signin",
}: LoginDialogProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);

  // Sync mode when initialMode prop changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const resetError = () => setError("");

  const finishLogin = (user: any) => {
    onLoginSuccess?.(user.name ?? user.email, user.email);

    // reload sidebar conversations
    window.dispatchEvent(new Event("conversations-updated"));

    onOpenChange(false);
  };

  // ================= LOGIN =================
  const handleLogin = async () => {
    resetError();

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      const response = await login(email.trim(), password);

      finishLogin(response.user);
    } catch (err) {
      setError("Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  // ================= REGISTER =================
  const handleRegister = async () => {
    resetError();

    if (!name || !email || !password) {
      setError("Semua field wajib diisi.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email: email.trim(),
          password,
        }),
      });

      if (!res.ok) {
        throw new Error("Register failed");
      }

      const loginRes = await login(email.trim(), password);

      finishLogin(loginRes.user);
    } catch {
      setError("Gagal mendaftar. Email mungkin sudah digunakan.");
    } finally {
      setLoading(false);
    }
  };

  // ================= SOCIAL LOGIN (UI ONLY) =================
  const handleSocialLogin = (provider: string) => {
    console.log("Login with", provider);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md p-8 rounded-2xl">

        {/* Logo */}
        <Image
          src="/logo.png"
          alt="LyraAI"
          width={40}
          height={40}
          className="mb-4 rounded-xl"
        />

        {/* Header */}
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold">
            {mode === "signin" ? "Sign in to LyraAI" : "Create your account"}
          </DialogTitle>
          <DialogDescription>
            Trusted by +50,000 professionals worldwide.
          </DialogDescription>
        </DialogHeader>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Social Login */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleSocialLogin("google")}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          <button
            onClick={() => handleSocialLogin("apple")}
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
            onClick={() => handleSocialLogin("twitter")}
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

        {/* Name */}
        {mode === "signup" && (
          <div className="mb-3">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="mt-1"
            />
          </div>
        )}

        {/* Email */}
        <div className="mb-3">
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="mt-1"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <Label>Password</Label>
          <div className="relative mt-1">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="pr-10"
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (mode === "signin" ? handleLogin() : handleRegister())
              }
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <Button
          className="w-full"
          onClick={mode === "signin" ? handleLogin : handleRegister}
          disabled={loading}
        >
          {loading
            ? "Loading..."
            : mode === "signin"
            ? "Login"
            : "Create Account"}
        </Button>

        {/* Switch mode */}
        <p className="text-sm text-center text-muted-foreground mt-4">
          {mode === "signin"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            onClick={() =>
              setMode(mode === "signin" ? "signup" : "signin")
            }
            className="underline font-medium"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>

      </DialogContent>
    </Dialog>
  );
}