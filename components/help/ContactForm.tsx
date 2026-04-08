"use client";

import { useState, useRef } from "react";
import { Send, CheckCircle, Paperclip, X, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

interface ContactFormProps {
  userEmail: string;
  userName?: string;
  isLoggedIn: boolean;
  onLoginRequest?: () => void;
}

type Priority    = "low" | "medium" | "high";
type SubmitState = "idle" | "submitting" | "uploading" | "success" | "error";

export function ContactForm({
  userEmail,
  userName,
  isLoggedIn,
  onLoginRequest,
}: ContactFormProps) {
  const [subject, setSubject]         = useState("");
  const [message, setMessage]         = useState("");
  const [priority, setPriority]       = useState<Priority>("medium");
  const [files, setFiles]             = useState<File[]>([]);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg]       = useState("");
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const valid    = selected.filter((f) => {
      if (f.size > MAX_FILE_SIZE) {
        setErrorMsg(`"${f.name}" melebihi batas 20MB`);
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...valid]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (i: number) =>
    setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setErrorMsg("Subject dan message wajib diisi.");
      return;
    }
    setErrorMsg("");
    setSubmitState("submitting");

    try {
      // 1. Buat tiket — cookie otomatis terbawa via credentials: "include"
      const ticketRes = await fetch(`${API_URL}/support/tickets`, {
        method:      "POST",
        credentials: "include",  // ← cookie httpOnly otomatis terbawa, tidak perlu Bearer
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ subject: subject.trim(), message: message.trim(), priority }),
      });

      if (!ticketRes.ok) {
        const err = await ticketRes.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal submit tiket");
      }

      const { ticket } = await ticketRes.json();

      // 2. Upload attachments (jika ada)
      if (files.length > 0) {
        setSubmitState("uploading");
        await Promise.all(
          files.map(async (file) => {
            const form = new FormData();
            form.append("file", file);
            const res = await fetch(
              `${API_URL}/support/tickets/${ticket.id}/attachments`,
              {
                method:      "POST",
                credentials: "include",
                body:        form,
                // Jangan set Content-Type manual — browser otomatis set multipart boundary
              }
            );
            if (!res.ok) throw new Error(`Gagal upload ${file.name}`);
          })
        );
      }

      setSubmitState("success");
      setSubject(""); setMessage(""); setPriority("medium"); setFiles([]);
    } catch (err: any) {
      setErrorMsg(err.message ?? "Terjadi kesalahan. Silakan coba lagi.");
      setSubmitState("error");
    }
  };

  const isLoading = submitState === "submitting" || submitState === "uploading";

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
        <p className="text-sm text-muted-foreground">
          Kamu perlu login untuk mengirim support ticket.
        </p>
        <Button onClick={onLoginRequest} variant="outline" size="sm">
          Login
        </Button>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (submitState === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle className="h-7 w-7 text-green-500" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">Tiket terkirim!</p>
          <p className="text-sm text-muted-foreground mt-1">
            Kami akan membalas ke <strong>{userEmail}</strong> dalam 4–8 jam.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setSubmitState("idle")} className="mt-2">
          Kirim tiket lain
        </Button>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Subject <span className="text-destructive">*</span>
        </label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Jelaskan masalah secara singkat"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Priority</label>
        <div className="flex gap-2">
          {(["low", "medium", "high"] as Priority[]).map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              disabled={isLoading}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-all",
                priority === p
                  ? p === "high"   ? "border-red-500 bg-red-500/10 text-red-600 ring-1 ring-red-500"
                  : p === "medium" ? "border-amber-500 bg-amber-500/10 text-amber-600 ring-1 ring-amber-500"
                                   : "border-green-500 bg-green-500/10 text-green-600 ring-1 ring-green-500"
                  : "border-border bg-background text-muted-foreground hover:bg-muted/50"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Message <span className="text-destructive">*</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Jelaskan masalah secara detail..."
          rows={5}
          disabled={isLoading}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Attachments{" "}
          <span className="text-xs text-muted-foreground">(opsional, maks 20MB per file)</span>
        </label>
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
                <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="flex-1 text-sm text-foreground truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">{formatSize(file.size)}</span>
                <button onClick={() => removeFile(i)} disabled={isLoading} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground hover:bg-muted/40 hover:border-primary/40 transition-colors disabled:opacity-50"
        >
          <Paperclip className="h-4 w-4" />
          Klik untuk attach file
        </button>
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{errorMsg}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-muted-foreground">
          {submitState === "uploading" ? `Mengupload ${files.length} file...`
            : submitState === "submitting" ? "Mengirim tiket..."
            : "Rata-rata respons: 4–8 jam"}
        </p>
        <Button onClick={handleSubmit} disabled={isLoading || !subject.trim() || !message.trim()} className="gap-2">
          {isLoading
            ? <><Loader2 className="h-4 w-4 animate-spin" />{submitState === "uploading" ? "Uploading..." : "Mengirim..."}</>
            : <><Send className="h-4 w-4" />Kirim Tiket</>}
        </Button>
      </div>
    </div>
  );
}