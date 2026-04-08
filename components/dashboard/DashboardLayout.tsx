"use client";

import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { DashboardHeader } from "./DashboardHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  useEffect(() => {
    const applyFontSize = () => {
      const saved = localStorage.getItem("admin_fontSize") as "small" | "medium" | "large" | null;
      const sizeMap = { small: "81.25%", medium: "87.5%", large: "100%" };
      document.documentElement.style.setProperty("--admin-fs", sizeMap[saved ?? "medium"]);
    };

    applyFontSize();
    window.addEventListener("admin-appearance-changed", applyFontSize);
    return () => window.removeEventListener("admin-appearance-changed", applyFontSize);
  }, []);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main
            id="dashboard-content"
            className="flex-1 overflow-y-auto bg-background p-6"
          >
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}