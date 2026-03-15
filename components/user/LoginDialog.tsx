"use client";

import { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
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
}

export function LoginDialog({
  open,
  onOpenChange,
  onLoginSuccess,
}: LoginDialogProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

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
        <div className="space-y-2 mb-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleSocialLogin("google")}
          >
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleSocialLogin("github")}
          >
            Continue with GitHub
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleSocialLogin("apple")}
          >
            Continue with Apple
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          <div className="flex-1 h-px bg-border" />
          or continue with email
          <div className="flex-1 h-px bg-border" />
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