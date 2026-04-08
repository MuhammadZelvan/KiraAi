"use client";

import {
  Archive, Trash2, Download, MoreVertical, Paperclip, Image,
  Link2, Send, Smile, Flag, Star, Forward, Clock, CheckCircle2,
  AlertCircle, Loader2, User, Shield, ExternalLink, ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import type { Email } from "@/app/email/page";
import type { SupportTicket, TicketReply, TicketAttachment } from "@/types/support";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────
interface EmailDetailProps {
  // Email mode
  email?: Email | null;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  // Ticket mode
  ticket?: SupportTicket | null;
  ticketReplies?: TicketReply[];
  ticketAttachments?: TicketAttachment[];
  onTicketStatusChange?: (id: string, status: string) => Promise<void>;
  onTicketReply?: (id: string, message: string) => Promise<void>;
  mode?: "email" | "ticket";
}

interface Message {
  id: string; content: string; sender: "them" | "me";
  time: string; avatar?: string; senderName?: string;
  attachments?: { name: string; type: string; url: string }[];
}

const statusConfig = {
  open:        { label: "Open",        color: "text-blue-500",  bg: "bg-blue-500/10",  border: "border-blue-500/30"  },
  in_progress: { label: "In Progress", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  resolved:    { label: "Resolved",    color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30" },
  closed:      { label: "Closed",      color: "text-muted-foreground", bg: "bg-muted", border: "border-border"        },
};

const priorityConfig = {
  low:    { label: "Low",    color: "text-green-500", bg: "bg-green-500/10"  },
  medium: { label: "Medium", color: "text-amber-500", bg: "bg-amber-500/10"  },
  high:   { label: "High",   color: "text-red-500",   bg: "bg-red-500/10"    },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export function EmailDetail({
  email, onArchive, onDelete,
  ticket, ticketReplies = [], ticketAttachments = [],
  onTicketStatusChange, onTicketReply,
  mode = "email",
}: EmailDetailProps) {
  const { toast } = useToast();

  // Email state
  const [replyText, setReplyText]           = useState("");
  const [messages, setMessages]             = useState<Message[]>(() =>
    email ? [{ id: "1", content: email.content, sender: "them", time: email.time, avatar: email.avatar, senderName: email.sender }] : []
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker]   = useState(false);
  const [attachedFiles, setAttachedFiles]       = useState<File[]>([]);

  // Ticket state
  const [ticketReplyText, setTicketReplyText] = useState("");
  const [isSendingReply, setIsSendingReply]   = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // ── Email handlers (unchanged logic) ──────────────────────────────────────
  const handleSendReply = () => {
    if (!replyText.trim() && attachedFiles.length === 0) return;
    const attachments = attachedFiles.map((f) => ({ name: f.name, type: f.type, url: URL.createObjectURL(f) }));
    setMessages((prev) => [...prev, {
      id: Date.now().toString(), content: replyText, sender: "me",
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      attachments: attachments.length > 0 ? attachments : undefined,
    }]);
    setReplyText("");
    setAttachedFiles([]);
    toast({ title: "Message sent", description: "Your reply has been sent successfully.", duration: 3000 });
  };

  const handleFileAttach = () => {
    const input = document.createElement("input");
    input.type = "file"; input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      setAttachedFiles((prev) => [...prev, ...files]);
    };
    input.click();
  };

  const handleImageAttach = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*"; input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      setAttachedFiles((prev) => [...prev, ...files]);
    };
    input.click();
  };

  const handleExport = () => {
    const text = messages.map((m) => `[${m.time}] ${m.sender === "them" ? m.senderName : "Me"}: ${m.content}`).join("\n\n");
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([text], { type: "text/plain" })), download: `conversation-${email?.sender?.replace(/\s+/g, "-")}-${Date.now()}.txt` });
    a.click();
    toast({ title: "Exported", description: "Conversation downloaded.", duration: 3000 });
  };

  // ── Ticket handlers ────────────────────────────────────────────────────────
  const handleTicketReply = async () => {
    if (!ticketReplyText.trim() || !ticket) return;
    setIsSendingReply(true);
    try {
      await onTicketReply?.(ticket.id, ticketReplyText.trim());
      setTicketReplyText("");
      toast({ title: "Reply sent!", description: `Email reply sent to ${ticket.user_email}` });
    } catch {
      toast({ title: "Failed to send reply", variant: "destructive" });
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return;
    setIsUpdatingStatus(true);
    try {
      await onTicketStatusChange?.(ticket.id, newStatus);
      toast({ title: "Status updated", description: `Ticket marked as ${newStatus.replace("_", " ")}` });
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  if (mode === "email" && !email) {
    return <div className="flex flex-1 items-center justify-center text-muted-foreground">Select an email</div>;
  }
  if (mode === "ticket" && !ticket) {
    return <div className="flex flex-1 items-center justify-center text-muted-foreground">Select a ticket</div>;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TICKET VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (mode === "ticket" && ticket) {
    const status   = statusConfig[ticket.status as keyof typeof statusConfig];
    const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig];
    const shortId  = ticket.id.slice(0, 8).toUpperCase();
    const initials = (ticket.user_name ?? ticket.user_email).split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

    return (
      <div className="flex flex-1 flex-col bg-background h-full">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-6 shrink-0">
          <div className="flex gap-4 min-w-0 flex-1">
            <Avatar className="h-12 w-12 shrink-0 ring-2 ring-border">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-semibold text-foreground">
                  {ticket.user_name ?? ticket.user_email.split("@")[0]}
                </span>
                <span className="text-sm text-muted-foreground">{ticket.user_email}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {/* Status badge */}
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border", status.bg, status.color, status.border)}>
                  {ticket.status === "open" && <AlertCircle className="h-3 w-3" />}
                  {ticket.status === "in_progress" && <Clock className="h-3 w-3" />}
                  {(ticket.status === "resolved" || ticket.status === "closed") && <CheckCircle2 className="h-3 w-3" />}
                  {status.label}
                </span>
                {/* Priority badge */}
                <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", priority.bg, priority.color)}>
                  {priority.label}
                </span>
                {/* Ticket ID */}
                <span className="text-xs text-muted-foreground font-mono">#{shortId}</span>
              </div>
            </div>
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <Select value={ticket.status} onValueChange={handleStatusChange} disabled={isUpdatingStatus}>
              <SelectTrigger className="h-9 w-36 text-xs">
                {isUpdatingStatus ? <Loader2 className="h-3 w-3 animate-spin" /> : <SelectValue />}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subject */}
        <div className="px-6 pt-4 pb-3 border-b border-border shrink-0 bg-muted/20">
          <h2 className="text-xl font-semibold text-foreground">{ticket.subject}</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Submitted {new Date(ticket.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* Thread */}
        <div className="flex-1 overflow-auto p-6 space-y-4 bg-muted/5">

          {/* Original message */}
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 shrink-0 ring-2 ring-border">
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="max-w-[75%] rounded-2xl border border-border bg-background px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <User className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs font-semibold text-muted-foreground">
                  {ticket.user_name ?? ticket.user_email}
                </p>
              </div>
              <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{ticket.message}</p>

              {/* Attachments */}
              {ticketAttachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {ticketAttachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.signedUrl ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm hover:bg-muted/70 transition-colors"
                    >
                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate text-foreground">{att.file_name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {(att.file_size / 1024).toFixed(0)} KB
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 ml-auto" />
                    </a>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                {new Date(ticket.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          {/* Replies thread */}
          {ticketReplies.map((rep) => {
            const isAdmin = rep.sender_role === "admin";
            return (
              <div key={rep.id} className={cn("flex gap-3", isAdmin && "justify-end")}>
                {!isAdmin && (
                  <Avatar className="h-10 w-10 shrink-0 ring-2 ring-border">
                    <AvatarFallback className="bg-muted text-xs">{initials}</AvatarFallback>
                  </Avatar>
                )}
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-3 shadow-sm",
                  isAdmin
                    ? "bg-primary/5 border border-primary/20"
                    : "bg-background border border-border"
                )}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {isAdmin ? <Shield className="h-3 w-3 text-primary" /> : <User className="h-3 w-3 text-muted-foreground" />}
                    <p className={cn("text-xs font-semibold", isAdmin ? "text-primary" : "text-muted-foreground")}>
                      {isAdmin ? "Support Team" : (ticket.user_name ?? ticket.user_email)}
                    </p>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{rep.message}</p>
                  <p className="text-xs text-muted-foreground mt-2 text-right">
                    {new Date(rep.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {isAdmin && (
                  <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">A</AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
        </div>

        {/* Reply box */}
        <div className="border-t border-border p-4 shrink-0 bg-background shadow-lg">
          <div className="rounded-xl border border-border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <div className="px-4 pt-3 pb-1">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Replying to <span className="text-foreground">{ticket.user_email}</span> via email
              </p>
            </div>
            <Textarea
              placeholder="Type your reply... (will be sent as email to the user)"
              value={ticketReplyText}
              onChange={(e) => setTicketReplyText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleTicketReply(); }}
              className="min-h-[80px] resize-none border-0 bg-transparent focus-visible:ring-0 text-sm"
            />
            <div className="flex items-center justify-between border-t border-border p-3 bg-muted/30">
              <p className="text-xs text-muted-foreground">⌘ + Enter to send</p>
              <Button
                onClick={handleTicketReply}
                className="gap-2"
                disabled={!ticketReplyText.trim() || isSendingReply}
              >
                {isSendingReply ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isSendingReply ? "Sending..." : "Send Reply"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EMAIL VIEW (original, unchanged)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-1 flex-col bg-background h-full">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border p-6 shrink-0 bg-background">
        <div className="flex gap-4 min-w-0 flex-1">
          <Avatar className="h-12 w-12 shrink-0 ring-2 ring-border">
            <AvatarImage src={email!.avatar} alt={email!.sender} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {email!.sender.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-semibold text-foreground">{email!.sender}</span>
              <span className="text-sm text-muted-foreground truncate">{email!.email}</span>
            </div>
            <p className="text-sm text-muted-foreground">To {email!.recipient}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-4">
          <span className="text-sm text-muted-foreground whitespace-nowrap mr-2">{email!.date}</span>
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10 hover:text-primary" onClick={() => { onArchive?.(email!.id); toast({ title: "Archived" }); }}>
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10 hover:text-primary" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem><Flag className="mr-2 h-4 w-4" />Mark as important</DropdownMenuItem>
              <DropdownMenuItem><Star className="mr-2 h-4 w-4" />Add to favorites</DropdownMenuItem>
              <DropdownMenuItem><Forward className="mr-2 h-4 w-4" />Forward</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-muted-foreground"><span className="text-xs">ID: {email!.id}</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Subject */}
      <div className="px-6 pt-4 pb-3 border-b border-border shrink-0 bg-muted/20">
        <h2 className="text-xl font-semibold text-foreground break-words">{email!.subject}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-6 space-y-4 bg-muted/5">
        {messages.map((message, index) => (
          <div key={message.id} className={cn("flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300", message.sender === "me" ? "justify-end" : "justify-start")} style={{ animationDelay: `${index * 50}ms` }}>
            {message.sender === "them" && (
              <Avatar className="h-10 w-10 shrink-0 ring-2 ring-border">
                <AvatarImage src={message.avatar} /><AvatarFallback>{message.senderName?.split(" ").map((n) => n[0]).join("") ?? "U"}</AvatarFallback>
              </Avatar>
            )}
            <div className={cn("max-w-[70%] rounded-2xl px-4 py-3 shadow-sm", message.sender === "me" ? "bg-primary/5 border border-primary/10" : "bg-background border border-border")}>
              {message.sender === "them" && <p className="text-xs font-semibold mb-1.5 text-muted-foreground">{message.senderName}</p>}
              {message.content && <p className="text-sm whitespace-pre-line break-words leading-relaxed">{message.content}</p>}
              {message.attachments?.map((att, idx) => (
                att.type.startsWith("image/")
                  ? <img key={idx} src={att.url} alt={att.name} className="rounded-lg max-w-full h-auto max-h-64 object-cover mt-2" />
                  : <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted mt-2"><Paperclip className="h-4 w-4 shrink-0" /><span className="text-sm truncate">{att.name}</span></div>
              ))}
              <p className={cn("text-xs mt-1.5 text-muted-foreground", message.sender === "me" ? "text-right" : "text-left")}>{message.time}</p>
            </div>
            {message.sender === "me" && (
              <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/20"><AvatarFallback className="bg-primary/10 text-primary font-semibold">Me</AvatarFallback></Avatar>
            )}
          </div>
        ))}
      </div>

      {/* Reply */}
      <div className="border-t border-border p-4 shrink-0 bg-background shadow-lg">
        <div className="rounded-xl border border-border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          {attachedFiles.length > 0 && (
            <div className="p-3 border-b border-border bg-muted/20">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Attached ({attachedFiles.length})</p>
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-lg text-sm">
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button onClick={() => setAttachedFiles((p) => p.filter((_, idx) => idx !== i))} className="text-destructive ml-1">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Textarea placeholder="Type your message..." value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }} className="min-h-[80px] resize-none border-0 bg-transparent focus-visible:ring-0 text-sm" />
          {showEmojiPicker && (
            <div className="p-3 border-t border-border bg-muted/20">
              <div className="flex flex-wrap gap-2">
                {["😊","😂","❤️","👍","🎉","🔥","✨","💯","🙏","👏","😍","🤔","😎","🚀","💪"].map((e) => (
                  <button key={e} onClick={() => { setReplyText((p) => p + e); setShowEmojiPicker(false); }} className="text-2xl hover:scale-125 transition-transform">{e}</button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-border p-3 bg-muted/30">
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={handleFileAttach}><Paperclip className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={handleImageAttach}><Image className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => setShowEmojiPicker(!showEmojiPicker)}><Smile className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => { const url = prompt("URL:"); if (url) setReplyText((p) => p + `[Link](${url})`); }}><Link2 className="h-4 w-4" /></Button>
            </div>
            <Button onClick={handleSendReply} className="gap-2" disabled={!replyText.trim() && attachedFiles.length === 0}>
              <Send className="h-4 w-4" />Send Now
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md border-destructive/20">
          <AlertDialogHeader className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10"><Trash2 className="h-6 w-6 text-destructive" /></div>
            <AlertDialogTitle className="text-center">Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription className="text-center">Delete conversation with <strong>{email!.sender}</strong>? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { onDelete?.(email!.id); setShowDeleteDialog(false); toast({ title: "Deleted", variant: "destructive" }); }} className="flex-1 bg-destructive hover:bg-destructive/90">
              <Trash2 className="h-4 w-4 mr-2" />Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}