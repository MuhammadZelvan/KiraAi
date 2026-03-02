"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EmailList } from "@/components/email/EmailList";
import { EmailDetail } from "@/components/email/EmailDetail";
import { useState, useEffect } from "react";

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
        id: "1",
        sender: "Marvin McKinney",
        email: "marvinganteng@gmail.com",
        subject: "Weekly Report: CRM Performance Recap",
        preview: "Dear Prabowo, This week's CRM stats are ready...",
        content: `Dear Prabowo,

This week's CRM stats are ready, and we've compiled a performance summary covering July 15–21.

The report highlights a 12% increase in new leads generated, with detailed breakdowns on follow-up times, sales pipeline activity, and engagement by channel. You'll also find updated leaderboards for agent performance and campaign reach.

Warm regards,
Marvin McKinney
Analyst Team – Blondex`,
        time: "08.25",
        date: "08.25 (18 menit yang lalu)",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        read: false,
        recipient: "Mas Prabowo",
    },
    {
        id: "2",
        sender: "Cody Fisher",
        email: "codyfisher@gmail.com",
        subject: "Pending Invoice Reminder for July",
        preview: "Hi Prabowo, Please confirm your open invoice...",
        content: `Hi Prabowo,

Please confirm your open invoice for July. The payment is due by the end of this week.

Best regards,
Cody Fisher`,
        time: "11.45",
        date: "11.45",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
        read: false,
        recipient: "Mas Prabowo",
    },
    {
        id: "3",
        sender: "Arlene McCoy",
        email: "arlene.mccoy@gmail.com",
        subject: "New Feature: Email Tracker Activated",
        preview: "Dear Prabowo, Email tracking is now active...",
        content: `Dear Prabowo,

Email tracking is now active on your account. You can now see when recipients open your emails and click on links.

Best regards,
Arlene McCoy`,
        time: "28 Jul",
        date: "28 Jul",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        read: true,
        recipient: "Mas Prabowo",
    },
    {
        id: "4",
        sender: "Savannah Nguyen",
        email: "savannah.nguyen@gmail.com",
        subject: "UI Update Preview: Layout Improvements",
        preview: "Hi Prabowo, Try the refreshed CRM layout...",
        content: `Hi Prabowo,

Try the refreshed CRM layout with improved navigation and better performance metrics display.

Best regards,
Savannah Nguyen`,
        time: "27 Jul",
        date: "27 Jul",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
        read: false,
        recipient: "Mas Prabowo",
    },
    {
        id: "5",
        sender: "Guy Hawkins",
        email: "guy.hawkins@gmail.com",
        subject: "Sales Summary: 4 Leads Closed Today",
        preview: "Dear Prabowo, You closed 4 leads this week...",
        content: `Dear Prabowo,

You closed 4 leads this week with a total value of $12,500. Great work!

Best regards,
Guy Hawkins`,
        time: "27 Jul",
        date: "27 Jul",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        read: true,
        recipient: "Mas Prabowo",
    },
];

export default function EmailPage() {
    const [emails, setEmails] = useState<Email[]>(initialEmails);
    const [selectedEmail, setSelectedEmail] = useState<Email>(initialEmails[0]);
    const [filter, setFilter] = useState<"all" | "read" | "unread">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isListVisible, setIsListVisible] = useState(true);

    // Mark email as read when selected
    const handleSelectEmail = (email: Email) => {
        setSelectedEmail(email);

        // Mark as read if it's unread
        if (!email.read) {
            setEmails(prevEmails => prevEmails.map(e =>
                e.id === email.id ? { ...e, read: true } : e
            ));
        }
    };

    // Toggle list visibility on double click
    const handleDoubleClick = () => {
        setIsListVisible(!isListVisible);
    };

    // Archive email
    const handleArchive = (emailId: string) => {
        setEmails(prevEmails => prevEmails.map(e =>
            e.id === emailId ? { ...e, archived: true } : e
        ));

        // Select next email if current is archived
        const remainingEmails = emails.filter(e => e.id !== emailId && !e.archived);
        if (remainingEmails.length > 0) {
            setSelectedEmail(remainingEmails[0]);
        }
    };

    // Delete email
    const handleDelete = (emailId: string) => {
        setEmails(prevEmails => prevEmails.filter(e => e.id !== emailId));

        // Select next email if current is deleted
        const remainingEmails = emails.filter(e => e.id !== emailId);
        if (remainingEmails.length > 0) {
            setSelectedEmail(remainingEmails[0]);
        }
    };

    const filteredEmails = emails.filter((email) => {
        // Exclude archived emails
        if (email.archived) return false;

        const matchesFilter =
            filter === "all" ||
            (filter === "read" && email.read) ||
            (filter === "unread" && !email.read);
        const matchesSearch =
            email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
            email.subject.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Auto-select first email when filter changes and current selection is not in list
    useEffect(() => {
        if (filteredEmails.length > 0) {
            const isCurrentEmailInList = filteredEmails.find(e => e.id === selectedEmail?.id);
            if (!isCurrentEmailInList) {
                setSelectedEmail(filteredEmails[0]);
            }
        }
    }, [filter, searchQuery]);

    return (
        <DashboardLayout>
            {/* Use negative margin to cancel out the padding from DashboardLayout main */}
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
                        />
                    )}
                    <div onDoubleClick={handleDoubleClick} className="flex-1">
                        <EmailDetail
                            email={selectedEmail}
                            onArchive={handleArchive}
                            onDelete={handleDelete}
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
