import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Chat {
  id: string;
  title: string;
  created_at: string;
}

export function groupChats(chats: Chat[]) {
  const today: Chat[] = [];
  const yesterday: Chat[] = [];
  const week: Chat[] = [];
  const older: Chat[] = [];

  const now = new Date();

  chats.forEach((chat) => {
    const created = new Date(chat.created_at);

    const diffDays =
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays < 1) today.push(chat);
    else if (diffDays < 2) yesterday.push(chat);
    else if (diffDays < 7) week.push(chat);
    else older.push(chat);
  });

  return { today, yesterday, week, older };
}