"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";
import { MessageSquare, Bell, Lock, Wrench, AlertTriangle, Zap, BellOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export function NotificationSettings() {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState<NotificationSetting[]>([
    {
      id: "new-message",
      title: "New Message",
      description:
        "Get instant notifications by email whenever you receive new messages, mentions, or replies from your team.",
      icon: <MessageSquare className="h-5 w-5 text-muted-foreground" />,
      enabled: false,
    },
    {
      id: "reminders",
      title: "Reminders & Schedules",
      description:
        "Receive timely alerts for upcoming tasks, meetings, or important events so you can stay organized and never miss a deadline.",
      icon: <Bell className="h-5 w-5 text-muted-foreground" />,
      enabled: true,
    },
    {
      id: "security-alert",
      title: "Security Alert",
      description:
        "Be alerted immediately when there's a login attempt from a new device or unusual location to help keep your account secure.",
      icon: <Lock className="h-5 w-5 text-muted-foreground" />,
      enabled: true,
    },
  ]);

  const [systemNotifications, setSystemNotifications] = useState<NotificationSetting[]>([
    {
      id: "maintenance",
      title: "Maintenance Update",
      description:
        "Stay informed about planned maintenance, server updates, or brief system downtimes so you can plan accordingly.",
      icon: <Wrench className="h-5 w-5 text-muted-foreground" />,
      enabled: true,
    },
    {
      id: "system-errors",
      title: "System Errors",
      description:
        "Receive alerts if system errors or failures affect your dashboard performance, ensuring you're always in the loop.",
      icon: <AlertTriangle className="h-5 w-5 text-muted-foreground" />,
      enabled: false,
    },
  ]);

  const [productivityNotifications, setProductivityNotifications] = useState<NotificationSetting[]>([
    {
      id: "distraction-alert",
      title: "Distraction Alert",
      description:
        "Detects when you're inactive or off-task, and gently reminds you to refocus and stay productive.",
      icon: <Zap className="h-5 w-5 text-muted-foreground" />,
      enabled: false,
    },
    {
      id: "dnd-mode",
      title: "Do Not Disturb Mode",
      description:
        "Automatically activate quiet hours during focus sessions or meetings. Notifications are silenced so you can work without interruption.",
      icon: <BellOff className="h-5 w-5 text-muted-foreground" />,
      enabled: true,
    },
  ]);

  const toggleNotification = (
    notifications: NotificationSetting[],
    setNotifications: React.Dispatch<React.SetStateAction<NotificationSetting[]>>,
    id: string
  ) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  };

  const defaultEmail = [
    { id: "new-message", enabled: false },
    { id: "reminders", enabled: true },
    { id: "security-alert", enabled: true },
  ];
  const defaultSystem = [
    { id: "maintenance", enabled: true },
    { id: "system-errors", enabled: false },
  ];
  const defaultProductivity = [
    { id: "distraction-alert", enabled: false },
    { id: "dnd-mode", enabled: true },
  ];

  const handleSave = () => {
    toast({
      title: "Notifications Saved",
      description: "Notification preferences have been updated.",
    });
  };

  const handleReset = () => {
    setEmailNotifications((prev) =>
      prev.map((n) => ({ ...n, enabled: defaultEmail.find((d) => d.id === n.id)?.enabled ?? n.enabled }))
    );
    setSystemNotifications((prev) =>
      prev.map((n) => ({ ...n, enabled: defaultSystem.find((d) => d.id === n.id)?.enabled ?? n.enabled }))
    );
    setProductivityNotifications((prev) =>
      prev.map((n) => ({ ...n, enabled: defaultProductivity.find((d) => d.id === n.id)?.enabled ?? n.enabled }))
    );
    toast({
      title: "Notifications Reset",
      description: "Notification settings restored to defaults.",
    });
  };

  const NotificationItem = ({
    setting,
    onToggle,
  }: {
    setting: NotificationSetting;
    onToggle: () => void;
  }) => (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-border last:border-b-0">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{setting.icon}</div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-foreground">{setting.title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
            {setting.description}
          </p>
        </div>
      </div>
      <Switch checked={setting.enabled} onCheckedChange={onToggle} />
    </div>
  );

  return (
    <div className="flex-1 space-y-8">
      {/* Notification Header */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">Notification</h2>
        <p className="text-sm text-muted-foreground">
          Manage preferences and personal information
        </p>
      </div>

      {/* Email Notifications */}
      <div className="space-y-2">
        <div className="border-b border-border pb-2">
          <h3 className="text-base font-semibold text-foreground">Email Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Stay updated via inbox alerts for messages and activities.
          </p>
        </div>
        <div>
          {emailNotifications.map((setting) => (
            <NotificationItem
              key={setting.id}
              setting={setting}
              onToggle={() =>
                toggleNotification(emailNotifications, setEmailNotifications, setting.id)
              }
            />
          ))}
        </div>
      </div>

      {/* System Notifications */}
      <div className="space-y-2">
        <div className="border-b border-border pb-2">
          <h3 className="text-base font-semibold text-foreground">System Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Monitor system health, errors, and service updates.
          </p>
        </div>
        <div>
          {systemNotifications.map((setting) => (
            <NotificationItem
              key={setting.id}
              setting={setting}
              onToggle={() =>
                toggleNotification(systemNotifications, setSystemNotifications, setting.id)
              }
            />
          ))}
        </div>
      </div>

      {/* Productivity Notifications */}
      <div className="space-y-2">
        <div className="border-b border-border pb-2">
          <h3 className="text-base font-semibold text-foreground">Productivity Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Boost focus with timely task and distraction alerts.
          </p>
        </div>
        <div>
          {productivityNotifications.map((setting) => (
            <NotificationItem
              key={setting.id}
              setting={setting}
              onToggle={() =>
                toggleNotification(
                  productivityNotifications,
                  setProductivityNotifications,
                  setting.id
                )
              }
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button variant="outline" onClick={handleReset}>Reset to Default</Button>
        <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={handleSave}>
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
