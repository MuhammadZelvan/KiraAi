"use client";

import { Archive, Trash2, Download, MoreVertical, Paperclip, Image, Link2, Send, Smile, Flag, Star, Forward } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import type { Email } from "@/app/email/page";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EmailDetailProps {
  email: Email;
  onArchive?: (emailId: string) => void;
  onDelete?: (emailId: string) => void;
}

interface Message {
  id: string;
  content: string;
  sender: "them" | "me";
  time: string;
  avatar?: string;
  senderName?: string;
  attachments?: {
    name: string;
    type: string;
    url: string;
  }[];
}

export function EmailDetail({ email, onArchive, onDelete }: EmailDetailProps) {
  const [replyText, setReplyText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: email.content,
      sender: "them",
      time: email.time,
      avatar: email.avatar,
      senderName: email.sender,
    },
  ]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useState<HTMLInputElement | null>(null)[0];
  const imageInputRef = useState<HTMLInputElement | null>(null)[0];
  const { toast } = useToast();

  const handleSendReply = () => {
    if (replyText.trim() || attachedFiles.length > 0) {
      // Create object URLs for file previews
      const attachments = attachedFiles.map(file => ({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
      }));

      const newMessage: Message = {
        id: Date.now().toString(),
        content: replyText,
        sender: "me",
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        attachments: attachments.length > 0 ? attachments : undefined,
      };
      setMessages([...messages, newMessage]);
      setReplyText("");
      setAttachedFiles([]);

      toast({
        title: "Message sent",
        description: attachedFiles.length > 0
          ? `Your reply with ${attachedFiles.length} attachment(s) has been sent.`
          : "Your reply has been sent successfully.",
        duration: 3000,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const handleFileAttach = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      setAttachedFiles(prev => [...prev, ...files]);
      toast({
        title: "Files attached",
        description: `${files.length} file(s) attached to your message.`,
        duration: 2000,
      });
    };
    input.click();
  };

  const handleImageAttach = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      setAttachedFiles(prev => [...prev, ...files]);
      toast({
        title: "Images attached",
        description: `${files.length} image(s) attached to your message.`,
        duration: 2000,
      });
    };
    input.click();
  };

  const handleEmojiClick = (emoji: string) => {
    setReplyText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleLinkInsert = () => {
    const url = prompt("Enter URL:");
    if (url) {
      const linkText = `[Link](${url})`;
      setReplyText(prev => prev + linkText);
      toast({
        title: "Link inserted",
        description: "Link has been added to your message.",
        duration: 2000,
      });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleArchive = () => {
    if (onArchive) {
      onArchive(email.id);
    }
    toast({
      title: "Conversation archived",
      description: "This conversation has been moved to archived folder.",
      duration: 3000,
    });
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(email.id);
    }
    setShowDeleteDialog(false);
    toast({
      title: "Conversation deleted",
      description: "This conversation has been permanently deleted.",
      variant: "destructive",
      duration: 3000,
    });
  };

  const handleExport = () => {
    const conversationText = messages.map(m =>
      `[${m.time}] ${m.sender === "them" ? m.senderName : "Me"}: ${m.content}`
    ).join("\n\n");

    const blob = new Blob([conversationText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation-${email.sender.replace(/\s+/g, "-")}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Conversation exported",
      description: "The conversation has been downloaded as a text file.",
      duration: 3000,
    });
  };

  const handleMarkImportant = () => {
    toast({
      title: "Marked as important",
      description: "This conversation has been flagged as important.",
      duration: 3000,
    });
  };

  const handleForward = () => {
    toast({
      title: "Forward conversation",
      description: "Forward functionality coming soon.",
      duration: 3000,
    });
  };

  return (
    <div className="flex flex-1 flex-col bg-background h-full">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border p-6 shrink-0 bg-background">
        <div className="flex gap-4 min-w-0 flex-1">
          <Avatar className="h-12 w-12 shrink-0 ring-2 ring-border">
            <AvatarImage src={email.avatar} alt={email.sender} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {email.sender
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-semibold text-foreground">
                {email.sender}
              </span>
              <span className="text-sm text-muted-foreground truncate">{email.email}</span>
            </div>
            <p className="text-sm text-muted-foreground">To {email.recipient}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-4">
          <span className="text-sm text-muted-foreground whitespace-nowrap mr-2">{email.date}</span>

          {/* Archive Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={handleArchive}
            title="Archive conversation"
          >
            <Archive className="h-4 w-4" />
          </Button>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={() => setShowDeleteDialog(true)}
            title="Delete conversation"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          {/* Export Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={handleExport}
            title="Export conversation"
          >
            <Download className="h-4 w-4" />
          </Button>

          {/* More Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleMarkImportant}>
                <Flag className="mr-2 h-4 w-4" />
                <span>Mark as important</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Star className="mr-2 h-4 w-4" />
                <span>Add to favorites</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleForward}>
                <Forward className="mr-2 h-4 w-4" />
                <span>Forward</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-muted-foreground">
                <span className="text-xs">Conversation ID: {email.id}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Subject */}
      <div className="px-6 pt-4 pb-3 border-b border-border shrink-0 bg-muted/20">
        <h2 className="text-xl font-semibold text-foreground break-words">
          {email.subject}
        </h2>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-auto p-6 space-y-4 bg-muted/5">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
              message.sender === "me" ? "justify-end" : "justify-start"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Avatar for incoming messages */}
            {message.sender === "them" && (
              <Avatar className="h-10 w-10 shrink-0 ring-2 ring-border">
                <AvatarImage src={message.avatar} alt={message.senderName} />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {message.senderName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>
            )}

            {/* Message Bubble */}
            <div
              className={cn(
                "max-w-[70%] rounded-2xl px-4 py-3 shadow-sm",
                message.sender === "me"
                  ? "bg-primary/5 border border-primary/10 text-foreground"
                  : "bg-background border border-border text-foreground"
              )}
            >
              {message.sender === "them" && (
                <p className="text-xs font-semibold mb-1.5 text-muted-foreground">
                  {message.senderName}
                </p>
              )}

              {/* Message Text */}
              {message.content && (
                <p className="text-sm whitespace-pre-line break-words leading-relaxed">
                  {message.content}
                </p>
              )}

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className={cn("mt-2 space-y-2", message.content && "mt-3")}>
                  {message.attachments.map((attachment, idx) => (
                    <div key={idx}>
                      {/* Image Preview */}
                      {attachment.type.startsWith('image/') ? (
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="rounded-lg max-w-full h-auto max-h-64 object-cover animate-in fade-in zoom-in-95 duration-300"
                        />
                      ) : (
                        /* File Attachment */
                        <div
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-200",
                            message.sender === "me"
                              ? "bg-primary/10"
                              : "bg-muted"
                          )}
                        >
                          <Paperclip className="h-4 w-4 shrink-0" />
                          <span className="text-sm truncate">{attachment.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p
                className={cn(
                  "text-xs mt-1.5",
                  message.sender === "me"
                    ? "text-right text-muted-foreground"
                    : "text-left text-muted-foreground"
                )}
              >
                {message.time}
              </p>
            </div>

            {/* Avatar for outgoing messages */}
            {message.sender === "me" && (
              <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  Me
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </div>

      {/* Reply Section - Fixed at Bottom */}
      <div className="border-t border-border p-4 shrink-0 bg-background shadow-lg">
        <div className="rounded-xl border border-border bg-background overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20">
          {/* Attached Files Preview */}
          {attachedFiles.length > 0 && (
            <div className="p-3 border-b border-border bg-muted/20">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                Attached Files ({attachedFiles.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-lg text-sm"
                  >
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                    <span className="text-foreground truncate max-w-[150px]">{file.name}</span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-destructive hover:text-destructive/80 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Textarea
            placeholder="Type your message..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={handleKeyPress}
            className="min-h-[80px] resize-none border-0 bg-transparent focus-visible:ring-0 text-sm"
          />

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="p-3 border-t border-border bg-muted/20 animate-in slide-in-from-bottom-2 fade-in duration-200">
              <div className="flex flex-wrap gap-2">
                {['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯', '🙏', '👏', '😍', '🤔', '😎', '🚀', '💪'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-2xl hover:scale-125 transition-transform duration-150 active:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border p-3 bg-muted/30">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                onClick={handleFileAttach}
                title="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                onClick={handleImageAttach}
                title="Attach image"
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Insert emoji"
              >
                <Smile className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                onClick={handleLinkInsert}
                title="Insert link"
              >
                <Link2 className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={handleSendReply}
              className="gap-2 shadow-sm hover:shadow-md transition-all"
              disabled={!replyText.trim() && attachedFiles.length === 0}
            >
              <Send className="h-4 w-4" />
              Send Now
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md border-destructive/20">
          <AlertDialogHeader className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center text-xl">
              Delete Conversation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base leading-relaxed">
              Are you sure you want to delete this conversation with{" "}
              <span className="font-semibold text-foreground">{email.sender}</span>?
              <br />
              <span className="text-sm text-muted-foreground mt-2 block">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="flex-1 hover:bg-muted transition-colors">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg hover:shadow-xl transition-all"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
