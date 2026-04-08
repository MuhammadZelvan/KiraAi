"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EmailList } from "@/components/email/EmailList";
import { EmailDetail } from "@/components/email/EmailDetail";
import { useState, useEffect, useCallback } from "react";
import type { SupportTicket, TicketReply, TicketAttachment } from "@/types/support";

export interface Email {
  id: string;
  sender: string;
  email: string;
  subject: string;
  preview: string;
  content: string;
  time: string;
  date: string;
  avatar: string;
  read: boolean;
  recipient: string;
  archived?: boolean;
}

const initialEmails: Email[] = [
  {
    id: "1", sender: "Marvin McKinney", email: "marvinganteng@gmail.com",
    subject: "Weekly Report: CRM Performance Recap",
    preview: "Dear Prabowo, This week's CRM stats are ready...",
    content: `Dear Prabowo,\n\nThis week's CRM stats are ready, and we've compiled a performance summary covering July 15–21.\n\nThe report highlights a 12% increase in new leads generated, with detailed breakdowns on follow-up times, sales pipeline activity, and engagement by channel.\n\nWarm regards,\nMarvin McKinney`,
    time: "08.25", date: "08.25 (18 menit yang lalu)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    read: false, recipient: "Mas Prabowo",
  },
  {
    id: "2", sender: "Cody Fisher", email: "codyfisher@gmail.com",
    subject: "Pending Invoice Reminder for July",
    preview: "Hi Prabowo, Please confirm your open invoice...",
    content: `Hi Prabowo,\n\nPlease confirm your open invoice for July. The payment is due by the end of this week.\n\nBest regards,\nCody Fisher`,
    time: "11.45", date: "11.45",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    read: false, recipient: "Mas Prabowo",
  },
  {
    id: "3", sender: "Arlene McCoy", email: "arlene.mccoy@gmail.com",
    subject: "New Feature: Email Tracker Activated",
    preview: "Dear Prabowo, Email tracking is now active...",
    content: `Dear Prabowo,\n\nEmail tracking is now active on your account.\n\nBest regards,\nArlene McCoy`,
    time: "28 Jul", date: "28 Jul",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    read: true, recipient: "Mas Prabowo",
  },
  {
    id: "4", sender: "Savannah Nguyen", email: "savannah.nguyen@gmail.com",
    subject: "UI Update Preview: Layout Improvements",
    preview: "Hi Prabowo, Try the refreshed CRM layout...",
    content: `Hi Prabowo,\n\nTry the refreshed CRM layout.\n\nBest regards,\nSavannah Nguyen`,
    time: "27 Jul", date: "27 Jul",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    read: false, recipient: "Mas Prabowo",
  },
  {
    id: "5", sender: "Guy Hawkins", email: "guy.hawkins@gmail.com",
    subject: "Sales Summary: 4 Leads Closed Today",
    preview: "Dear Prabowo, You closed 4 leads this week...",
    content: `Dear Prabowo,\n\nYou closed 4 leads this week with a total value of $12,500.\n\nBest regards,\nGuy Hawkins`,
    time: "27 Jul", date: "27 Jul",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    read: true, recipient: "Mas Prabowo",
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────
import {
  getSupportTickets,
  getSupportTicketDetail,
  replySupportTicket,
  updateSupportTicketStatus,
} from "@/lib/adminApi";

export default function EmailPage() {
  // ── Email state ────────────────────────────────────────────────────────────
  const [emails, setEmails]               = useState<Email[]>(initialEmails);
  const [selectedEmail, setSelectedEmail] = useState<Email>(initialEmails[0]);
  const [filter, setFilter]               = useState<"all" | "read" | "unread">("all");
  const [searchQuery, setSearchQuery]     = useState("");
  const [isListVisible, setIsListVisible] = useState(true);

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"email" | "tickets">("email");

  // ── Support tickets state ──────────────────────────────────────────────────
  const [tickets, setTickets]               = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplies, setTicketReplies]   = useState<TicketReply[]>([]);
  const [ticketAttachments, setTicketAttachments] = useState<TicketAttachment[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  // ── Fetch all tickets (admin) ──────────────────────────────────────────────
  const fetchTickets = useCallback(async () => {
    setTicketsLoading(true);
    try {
      const data = await getSupportTickets();
      setTickets(data.tickets);
    } catch (err) {
      console.error("fetchTickets error:", err);
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  // ── Fetch ticket detail (replies + attachments) ───────────────────────────
  const fetchTicketDetail = useCallback(async (ticketId: string) => {
    try {
      const data = await getSupportTicketDetail(ticketId);
      setTicketReplies(data.replies ?? []);
      setTicketAttachments(data.attachments ?? []);
    } catch (err) {
      console.error("fetchTicketDetail error:", err);
    }
  }, []);

  // ── Load tickets when tab switches to "tickets" ───────────────────────────
  useEffect(() => {
    if (activeTab === "tickets" && tickets.length === 0) {
      fetchTickets();
    }
  }, [activeTab]);

  // ── Load detail when ticket selected ──────────────────────────────────────
  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    fetchTicketDetail(ticket.id);
  };

  // ── Admin reply ────────────────────────────────────────────────────────────
  const handleTicketReply = async (ticketId: string, message: string) => {
    const data = await replySupportTicket(ticketId, message);
    setTicketReplies((prev) => [...prev, data.reply]);
    setTickets((prev) =>
      prev.map((t) => t.id === ticketId && t.status === "open" ? { ...t, status: "in_progress" as const } : t)
    );
  };

  // ── Update ticket status ───────────────────────────────────────────────────
  const handleTicketStatusChange = async (ticketId: string, status: string) => {
    const data = await updateSupportTicketStatus(ticketId, status);
    setTickets((prev) => prev.map((t) => t.id === ticketId ? data.ticket : t));
    setSelectedTicket((prev) => prev?.id === ticketId ? data.ticket : prev);
  };

  // ── Email handlers ────────────────────────────────────────────────────────
  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    if (!email.read) {
      setEmails((prev) => prev.map((e) => e.id === email.id ? { ...e, read: true } : e));
    }
  };

  const handleArchive = (emailId: string) => {
    setEmails((prev) => prev.map((e) => e.id === emailId ? { ...e, archived: true } : e));
    const remaining = emails.filter((e) => e.id !== emailId && !e.archived);
    if (remaining.length > 0) setSelectedEmail(remaining[0]);
  };

  const handleDelete = (emailId: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== emailId));
    const remaining = emails.filter((e) => e.id !== emailId);
    if (remaining.length > 0) setSelectedEmail(remaining[0]);
  };

  const filteredEmails = emails.filter((email) => {
    if (email.archived) return false;
    const matchesFilter = filter === "all" || (filter === "read" && email.read) || (filter === "unread" && !email.read);
    const matchesSearch = email.sender.toLowerCase().includes(searchQuery.toLowerCase()) || email.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    if (filteredEmails.length > 0) {
      const inList = filteredEmails.find((e) => e.id === selectedEmail?.id);
      if (!inList) setSelectedEmail(filteredEmails[0]);
    }
  }, [filter, searchQuery]);

  return (
    <DashboardLayout>
      <div className="-m-6 h-[calc(100vh-4rem)]">
        <div className="flex h-full gap-0 bg-background">
          {isListVisible && (
            <EmailList
              emails={filteredEmails}
              selectedEmail={selectedEmail}
              onSelectEmail={handleSelectEmail}
              filter={filter}
              onFilterChange={setFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              // Support tickets
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tickets={tickets}
              selectedTicket={selectedTicket}
              onSelectTicket={handleSelectTicket}
              ticketsLoading={ticketsLoading}
            />
          )}

          <div
            onDoubleClick={() => setIsListVisible(!isListVisible)}
            className="flex-1 min-w-0"
          >
            {activeTab === "email" ? (
              <EmailDetail
                mode="email"
                email={selectedEmail}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            ) : (
              <EmailDetail
                mode="ticket"
                ticket={selectedTicket}
                ticketReplies={ticketReplies}
                ticketAttachments={ticketAttachments}
                onTicketReply={handleTicketReply}
                onTicketStatusChange={handleTicketStatusChange}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}