"use client";

import { useState } from "react";
import { Eye, EyeOff, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess?: (name: string, email: string) => void;
}

// ---------- Simple local "database" using localStorage ----------
interface StoredUser {
  name: string;
  email: string;
  password: string;
}

function getStoredUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("LyraAI_users") || "[]");
  } catch {
    return [];
  }
}

function saveUser(user: StoredUser) {
  const users = getStoredUsers();
  users.push(user);
  localStorage.setItem("LyraAI_users", JSON.stringify(users));
}

function findUser(email: string, password: string): StoredUser | null {
  const users = getStoredUsers();
  return users.find((u) => u.email === email && u.password === password) ?? null;
}

function emailExists(email: string): boolean {
  return getStoredUsers().some((u) => u.email === email);
}
// ---------------------------------------------------------------

const oauthProviders = [
  {
    label: "Continue with Google",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    ),
  },
  {
    label: "Continue with Apple",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
  },
  {
    label: "Continue with X (Twitter)",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export function LoginDialog({ open, onOpenChange, onLoginSuccess }: LoginDialogProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sign in fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign up fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);

  const resetErrors = () => { setError(""); setSuccessMsg(""); };

  const handleLogin = () => {
    resetErrors();
    if (!loginEmail || !loginPassword) {
      setError("Email dan password wajib diisi.");
      return;
    }
    const user = findUser(loginEmail, loginPassword);
    if (!user) {
      setError("Email atau password salah. Belum punya akun? Daftar dulu.");
      return;
    }
    onLoginSuccess?.(user.name, user.email);
    onOpenChange(false);
  };

  const handleSignUp = () => {
    resetErrors();
    if (!regName || !regEmail || !regPassword || !regConfirm) {
      setError("Semua field wajib diisi.");
      return;
    }
    if (regPassword.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (regPassword !== regConfirm) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }
    if (!agreed) {
      setError("Kamu harus setuju dengan syarat & ketentuan.");
      return;
    }
    if (emailExists(regEmail)) {
      setError("Email sudah terdaftar. Silakan login.");
      return;
    }

    // Save to localStorage
    saveUser({ name: regName, email: regEmail, password: regPassword });

    // Show success & switch to sign-in (don't auto-login)
    setSuccessMsg("Akun berhasil dibuat! Silakan login sekarang.");
    setLoginEmail(regEmail);
    setLoginPassword("");
    setTimeout(() => {
      switchMode("signin");
    }, 1500);
  };

  const switchMode = (m: "signin" | "signup") => {
    setMode(m);
    resetErrors();
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md p-6 sm:p-8 gap-0 rounded-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Logo */}
        <Image src="/logo.png" alt="LyraAI" width={40} height={40} className="mb-4 rounded-xl object-contain drop-shadow-sm" />

        <DialogHeader className="text-left space-y-1 p-0 mb-5">
          <DialogTitle className="text-xl font-semibold">
            {mode === "signin" ? "Sign in to LyraAI" : "Sign Up to LyraAI"}
          </DialogTitle>
          <DialogDescription>
            Trusted by +50,000 professionals world wide.
          </DialogDescription>
        </DialogHeader>

        {/* Error / Success message */}
        {(error || successMsg) && (
          <div className={`mb-4 flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm ${successMsg
            ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
            : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}>
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error || successMsg}</span>
          </div>
        )}

        {mode === "signin" ? (
          <div className="space-y-3">
            {/* OAuth */}
            {oauthProviders.map((provider) => (
              <button
                key={provider.label}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  {provider.icon}
                  <span>{provider.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground">OR WITH</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground">Email</Label>
                <Input
                  value={loginEmail}
                  onChange={(e) => { setLoginEmail(e.target.value); resetErrors(); }}
                  placeholder="Enter your email"
                  className="mt-1"
                  type="email"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Password</Label>
                <div className="relative mt-1">
                  <Input
                    value={loginPassword}
                    onChange={(e) => { setLoginPassword(e.target.value); resetErrors(); }}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    className="pr-10"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => switchMode("signup")}
                className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
              >
                Sign up now!
              </button>
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Forgot your password?
              </button>
              <Button onClick={handleLogin} className="px-8 rounded-lg">
                Login
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-muted-foreground">Name</Label>
              <Input
                value={regName}
                onChange={(e) => { setRegName(e.target.value); resetErrors(); }}
                placeholder="Enter your name"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Email</Label>
              <Input
                value={regEmail}
                onChange={(e) => { setRegEmail(e.target.value); resetErrors(); }}
                placeholder="Enter your email"
                className="mt-1"
                type="email"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Password</Label>
              <div className="relative mt-1">
                <Input
                  value={regPassword}
                  onChange={(e) => { setRegPassword(e.target.value); resetErrors(); }}
                  type={showPassword ? "text" : "password"}
                  placeholder="Must be at least 8 characters"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Confirm Password</Label>
              <div className="relative mt-1">
                <Input
                  value={regConfirm}
                  onChange={(e) => { setRegConfirm(e.target.value); resetErrors(); }}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Must be at least 8 characters"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(v) => { setAgreed(v === true); resetErrors(); }}
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer select-none">
                I Agree to the terms &amp; Privacy
              </label>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Forgot your password?
              </button>
              <Button
                onClick={handleSignUp}
                disabled={!regName || !regEmail || !agreed}
                className="px-8 rounded-lg"
              >
                Sign Up
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={() => switchMode("signin")}
                className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
              >
                Sign in!
              </button>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
