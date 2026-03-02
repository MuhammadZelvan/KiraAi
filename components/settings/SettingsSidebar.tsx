import { User, Bell, Shield, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsTab = "general" | "appearance" | "notification" | "security";

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

const menuItems = [
  { id: "general" as const, label: "General", icon: User },
  { id: "appearance" as const, label: "Appearance", icon: Palette },
  { id: "notification" as const, label: "Notification", icon: Bell },
  { id: "security" as const, label: "Security", icon: Shield },
];

export function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  return (
    <div className="w-full max-w-[200px] space-y-1">
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Settings Menu
      </p>
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
            activeTab === item.id
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
