"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ChevronDown,
  Save,
  Copy,
  MoreHorizontal,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSettings, saveSettings, logout } from "@/lib/api";
import { useRouter } from "next/navigation";

export function UserSettings() {
  const { setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("general");

  // Load from localStorage on first render
  const load = (key: string, fallback: string) =>
    typeof window !== "undefined"
      ? (localStorage.getItem(`lyra_${key}`) ?? fallback)
      : fallback;
  const loadBool = (key: string, fallback: boolean) =>
    typeof window !== "undefined"
      ? localStorage.getItem(`lyra_${key}`) !== null
        ? localStorage.getItem(`lyra_${key}`) === "true"
        : fallback
      : fallback;

  const [fullName, setFullName] = useState(() => load("fullName", "Zelvan"));
  const [callName, setCallName] = useState(() => load("callName", "Zelvan"));
  const [occupation, setOccupation] = useState(() => load("occupation", ""));
  const [preferences, setPreferences] = useState(() => load("preferences", ""));
  const [notifyCompletion, setNotifyCompletion] = useState(() =>
    loadBool("notifyCompletion", false),
  );
  const [colorMode, setColorMode] = useState(() => load("colorMode", "auto"));
  const [chatFont, setChatFont] = useState(() => load("chatFont", "Default"));
  const [searchEnabled, setSearchEnabled] = useState(() =>
    loadBool("searchEnabled", true),
  );
  const [voiceProfile, setVoiceProfile] = useState(() =>
    load("voiceProfile", "alloy"),
  );
  const [speechSpeed, setSpeechSpeed] = useState(() =>
    load("speechSpeed", "1.0"),
  );
  const [autoPlayVoice, setAutoPlayVoice] = useState(() =>
    loadBool("autoPlayVoice", false),
  );

  // Saved snapshots used for dirty detection
  const [saved, setSaved] = useState({
    fullName,
    callName,
    occupation,
    preferences,
    notifyCompletion,
    colorMode,
    chatFont,
    searchEnabled,
    voiceProfile,
    speechSpeed,
    autoPlayVoice,
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadSettings() {
      const data = await getSettings();
      if (!data) return;

      const newSettings = {
        fullName: data.full_name ?? "",
        callName: data.call_name ?? "",
        occupation: data.occupation ?? "",
        preferences: data.preferences ?? "",
        notifyCompletion: data.notify_completion ?? false,
        colorMode: data.color_mode ?? "auto",
        chatFont: data.chat_font ?? "Default",
        searchEnabled: data.search_enabled ?? true,
      };

      setFullName(newSettings.fullName);
      setCallName(newSettings.callName);
      setOccupation(newSettings.occupation);
      setPreferences(newSettings.preferences);
      setNotifyCompletion(newSettings.notifyCompletion);
      setColorMode(newSettings.colorMode);
      setChatFont(newSettings.chatFont);
      setSearchEnabled(newSettings.searchEnabled);

      setSaved({
        ...newSettings,
        voiceProfile,
        speechSpeed,
        autoPlayVoice,
      });
    }

    loadSettings();
  }, []);

  // Dirty check
  useEffect(() => {
    const changed =
      fullName !== saved.fullName ||
      callName !== saved.callName ||
      occupation !== saved.occupation ||
      preferences !== saved.preferences ||
      notifyCompletion !== saved.notifyCompletion ||
      colorMode !== saved.colorMode ||
      chatFont !== saved.chatFont ||
      searchEnabled !== saved.searchEnabled ||
      voiceProfile !== saved.voiceProfile ||
      speechSpeed !== saved.speechSpeed ||
      autoPlayVoice !== saved.autoPlayVoice;
    setIsDirty(changed);
    if (changed) setJustSaved(false);
  }, [
    fullName,
    callName,
    occupation,
    preferences,
    notifyCompletion,
    colorMode,
    chatFont,
    searchEnabled,
    voiceProfile,
    speechSpeed,
    autoPlayVoice,
    saved,
  ]);

  // Apply color mode immediately when it changes
  useEffect(() => {
    const map: Record<string, string> = {
      light: "light",
      dark: "dark",
      auto: "system",
    };
    setTheme(map[colorMode] ?? "system");
  }, [colorMode, setTheme]);

  // Apply font immediately when it changes
  useEffect(() => {
    const fontMap: Record<string, string> = {
      Default: "'Georgia', serif",
      Sans: "'Inter', sans-serif",
      System: "system-ui, sans-serif",
      "Dyslexic friendly": "'OpenDyslexic', 'Comic Sans MS', cursive",
    };
    document.documentElement.style.setProperty(
      "--chat-font",
      fontMap[chatFont] ?? fontMap.Default,
    );
  }, [chatFont]);

  const handleLogout = async () => {
    try {
      await logout();

      // optional: clear local data
      localStorage.removeItem("lyra_fullName");
      localStorage.removeItem("lyra_callName");

      router.push("/login"); // atau "/"
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      await saveSettings({
        fullName,
        callName,
        occupation,
        preferences,
        notifyCompletion,
        colorMode,
        chatFont,
        searchEnabled,
      });

      setSaved({
        fullName,
        callName,
        occupation,
        preferences,
        notifyCompletion,
        colorMode,
        chatFont,
        searchEnabled,
        voiceProfile,
        speechSpeed,
        autoPlayVoice,
      });

      setJustSaved(true);
      setIsDirty(false);
    } catch (err) {
      console.error("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General" },
    { id: "account", label: "Account" },
    { id: "capabilities", label: "Capabilities" },
  ];

  return (
    <div className="flex justify-center h-full bg-background overflow-y-auto w-full relative">
      <div className="flex flex-col md:flex-row w-full max-w-5xl px-4 md:px-8 py-10 gap-x-12">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-56 shrink-0 flex flex-col mb-8 md:mb-0">
          <h1 className="text-2xl font-serif text-foreground mb-8 pl-4">
            Settings
          </h1>

          <div className="flex flex-row md:flex-col gap-1 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap text-left",
                  activeTab === tab.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full max-w-3xl pb-24 relative">
          {activeTab === "general" && (
            <div className="space-y-10 animate-in fade-in duration-300">
              {/* Profile Information */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Full name
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-muted flex flex-col items-center justify-center border border-border">
                        <span className="text-sm font-semibold text-foreground uppercase">
                          {fullName.charAt(0) || "Z"}
                        </span>
                      </div>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-11 bg-background border-border/60"
                      />
                    </div>
                  </div>

                  {/* Call Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      What should LyraAI call you?
                    </label>
                    <Input
                      value={callName}
                      onChange={(e) => setCallName(e.target.value)}
                      className="h-11 bg-background border-border/60"
                    />
                  </div>
                </div>

                {/* Occupation */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    What best describes your work?
                  </label>
                  <div className="relative">
                    <select
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="w-full h-11 px-3 rounded-md border border-border/60 bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        Select your work function
                      </option>
                      <option value="student">Student</option>
                      <option value="developer">Software Developer</option>
                      <option value="designer">Creative / Designer</option>
                      <option value="marketing">Marketing / Business</option>
                      <option value="other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    What{" "}
                    <span className="underline decoration-muted-foreground/50 underline-offset-4 cursor-help text-foreground/90">
                      personal preferences
                    </span>{" "}
                    should LyraAI consider in responses?
                  </label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your preferences will apply to all conversations, within{" "}
                    <span className="underline decoration-muted-foreground/50 underline-offset-4 cursor-help text-foreground/90">
                      LyraAI's guidelines
                    </span>
                    .
                  </p>
                  <Textarea
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    placeholder="e.g. I primarily code in Python (not a coding beginner)"
                    className="min-h-[120px] resize-none bg-background py-3 mt-2 border-border/60"
                  />
                </div>
              </div>

              <div className="w-full h-px bg-border/40" />

              {/* Notifications */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-foreground tracking-tight">
                  Notifications
                </h3>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">
                      Response completions
                    </h4>
                    <p className="text-[13px] text-muted-foreground mt-1 max-w-[85%]">
                      Get notified when LyraAI has finished a response. Most
                      useful for long-running tasks like tool calls and
                      Research.
                    </p>
                  </div>
                  <Switch
                    checked={notifyCompletion}
                    onCheckedChange={setNotifyCompletion}
                    className="mt-0.5"
                  />
                </div>
              </div>

              <div className="w-full h-px bg-border/40" />

              {/* Appearance */}
              <div className="space-y-5">
                <h3 className="text-base font-bold text-foreground tracking-tight">
                  Appearance
                </h3>
                <div className="space-y-3">
                  <label className="text-[13px] font-medium text-foreground">
                    Color mode
                  </label>
                  <div className="flex flex-wrap items-center gap-5 pt-1">
                    {/* Light */}
                    <div className="flex flex-col items-center gap-3">
                      <button
                        onClick={() => setColorMode("light")}
                        className={cn(
                          "relative w-32 h-[84px] rounded-xl border flex flex-col overflow-hidden transition-all bg-[#f4f5f9] p-2.5",
                          colorMode === "light"
                            ? "border-primary ring-1 ring-primary"
                            : "border-border/60 hover:border-foreground/30",
                        )}
                      >
                        <div className="w-10 h-1 rounded-full bg-black/20 self-end mt-1" />
                        <div className="flex flex-col gap-[5px] mt-4 px-1">
                          <div className="w-16 h-1 rounded-full bg-black/10" />
                          <div className="w-10 h-1 rounded-full bg-black/10" />
                        </div>
                        <div className="w-full h-[22px] mt-auto rounded-md bg-white border border-black/5 flex items-center justify-end px-2 shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#6E42FD]" />
                        </div>
                      </button>
                      <span className="text-[13px] text-muted-foreground">
                        Light
                      </span>
                    </div>

                    {/* Auto */}
                    <div className="flex flex-col items-center gap-3">
                      <button
                        onClick={() => setColorMode("auto")}
                        className={cn(
                          "relative w-32 h-[84px] rounded-xl border flex flex-col overflow-hidden transition-all",
                          colorMode === "auto"
                            ? "border-primary ring-1 ring-primary"
                            : "border-border/60 hover:border-foreground/30",
                        )}
                      >
                        <div className="flex flex-1 w-full h-full">
                          <div className="w-1/2 bg-indigo-50/50 border-r border-border/20 flex flex-col p-2.5 gap-[5px] justify-start overflow-hidden">
                            <div className="flex flex-col gap-[5px] mt-4">
                              <div className="w-[120px] h-1 rounded-full bg-black/10" />
                              <div className="w-[80px] h-1 rounded-full bg-black/10" />
                            </div>
                            <div className="w-[180px] h-[22px] mt-auto rounded bg-white flex flex-shrink-0 items-center justify-end px-1.5 border border-black/5 shadow-sm relative z-10 left-0" />
                          </div>
                          <div className="w-1/2 bg-[#18181b] flex flex-col p-2.5 gap-[5px] justify-start relative overflow-hidden">
                            <div className="w-10 h-1 rounded-full bg-white/20 self-end mt-1 absolute right-2.5 top-3.5" />
                            <div className="w-full h-[22px] mt-auto rounded bg-[#27272a] flex items-center justify-end px-1.5 border border-white/5 shadow-sm absolute right-2.5 bottom-2.5 min-w-[55px]">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#6E42FD]" />
                            </div>
                          </div>
                        </div>
                      </button>
                      <span className="text-[13px] text-muted-foreground">
                        Auto
                      </span>
                    </div>

                    {/* Dark */}
                    <div className="flex flex-col items-center gap-3">
                      <button
                        onClick={() => setColorMode("dark")}
                        className={cn(
                          "relative w-32 h-[84px] rounded-xl border flex flex-col overflow-hidden transition-all bg-[#18181b] p-2.5",
                          colorMode === "dark"
                            ? "border-primary ring-1 ring-primary"
                            : "border-border/60 hover:border-foreground/30",
                        )}
                      >
                        <div className="w-10 h-1 rounded-full bg-white/20 self-end mt-1" />
                        <div className="flex flex-col gap-[5px] mt-4 px-1">
                          <div className="w-16 h-1 rounded-full bg-white/10" />
                          <div className="w-10 h-1 rounded-full bg-white/10" />
                        </div>
                        <div className="w-full h-[22px] mt-auto rounded-md bg-[#27272a] border border-white/5 flex items-center justify-end px-2 shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#6E42FD]" />
                        </div>
                      </button>
                      <span className="text-[13px] text-muted-foreground">
                        Dark
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat font */}
              <div className="space-y-4 pt-2">
                <h3 className="text-[13px] font-medium text-foreground">
                  Chat font
                </h3>
                <div className="flex flex-wrap gap-4 pt-1">
                  {["Default", "Sans", "System", "Dyslexic friendly"].map(
                    (font) => (
                      <div
                        key={font}
                        className="flex flex-col items-center gap-3"
                      >
                        <button
                          onClick={() => setChatFont(font)}
                          className={cn(
                            "h-[84px] w-28 rounded-xl border flex items-center justify-center transition-all bg-card shadow-sm",
                            chatFont === font
                              ? "border-primary ring-1 ring-primary bg-primary/5"
                              : "border-border/60 hover:border-foreground/30",
                          )}
                        >
                          <span
                            className={cn(
                              "text-[28px] text-foreground/90",
                              font === "Sans"
                                ? "font-sans"
                                : font === "System"
                                  ? "font-system"
                                  : "font-serif",
                            )}
                          >
                            Aa
                          </span>
                        </button>
                        <span className="text-[13px] text-muted-foreground">
                          {font}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="w-full h-px bg-border/40 mt-6" />

              {/* Detailed Voice Settings */}
              <div className="space-y-6 pb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground tracking-tight">
                    AI Voice Settings
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure how LyraAI communicates with you via audio.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Voice Profile Dropdown */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Voice Profile
                    </label>
                    <div className="relative">
                      <select
                        value={voiceProfile}
                        onChange={(e) => setVoiceProfile(e.target.value)}
                        className="w-full h-11 px-3 rounded-md border border-border/60 bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                      >
                        <option value="alloy">Alloy (Clear, Neutral)</option>
                        <option value="echo">Echo (Warm, Confident)</option>
                        <option value="fable">
                          Fable (Animated, Expressive)
                        </option>
                        <option value="nova">
                          Nova (Bright, Professional)
                        </option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select the AI's speaking voice.
                    </p>
                  </div>

                  {/* Speech Speed Dropdown/Slider equivalent */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Speech Speed
                    </label>
                    <div className="relative">
                      <select
                        value={speechSpeed}
                        onChange={(e) => setSpeechSpeed(e.target.value)}
                        className="w-full h-11 px-3 rounded-md border border-border/60 bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                      >
                        <option value="0.75">Slow (0.75x)</option>
                        <option value="1.0">Normal (1.0x)</option>
                        <option value="1.25">Fast (1.25x)</option>
                        <option value="1.5">Very Fast (1.50x)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Auto-play Switch */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">
                      Auto-play audio responses
                    </h4>
                    <p className="text-[13px] text-muted-foreground mt-1 max-w-[85%]">
                      Automatically read aloud the AI's messages when generated.
                    </p>
                  </div>
                  <Switch
                    checked={autoPlayVoice}
                    onCheckedChange={setAutoPlayVoice}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Account
              </h2>

              <div className="space-y-6">
                {/* Actions */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm font-medium text-foreground">
                    Log out of all devices
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-md"
                    onClick={handleLogout}
                  >
                    Log out
                  </Button>
                </div>

                <div className="flex items-center justify-between py-1 border-t border-border/40 pt-5">
                  <span className="text-sm font-medium text-foreground">
                    Delete your account
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white text-black hover:bg-gray-100 rounded-md"
                  >
                    Delete account
                  </Button>
                </div>

                <div className="flex items-center justify-between py-1 border-t border-border/40 pt-5">
                  <span className="text-sm font-medium text-foreground">
                    Organization ID
                  </span>
                  <div className="flex items-center gap-3 bg-muted/40 px-3 py-1.5 rounded-md border border-border/50">
                    <span className="text-xs font-mono text-muted-foreground">
                      3335a215-5c87-4ff4-a29b-031c15e15c50
                    </span>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="mt-14 pt-6 border-t border-border/40">
                <h3 className="text-[15px] font-bold text-foreground mb-4">
                  Active sessions
                </h3>
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground">
                        <th className="pb-3 font-medium min-w-[180px]">
                          Device
                        </th>
                        <th className="pb-3 font-medium min-w-[200px]">
                          Location
                        </th>
                        <th className="pb-3 font-medium min-w-[160px]">
                          Created
                        </th>
                        <th className="pb-3 font-medium min-w-[160px]">
                          Updated
                        </th>
                        <th className="pb-3 font-medium w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      <tr className="hover:bg-muted/10 transition-colors">
                        <td className="py-4 font-medium text-foreground">
                          Chrome Mobile (Android)
                        </td>
                        <td className="py-4 text-muted-foreground">
                          Purwokerto, Central Java, ID
                        </td>
                        <td className="py-4 text-muted-foreground">
                          Mar 1, 2026, 10:57 AM
                        </td>
                        <td className="py-4 text-muted-foreground">
                          Mar 2, 2026, 11:16 AM
                        </td>
                        <td className="py-4 text-right">
                          <button className="text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4 inline-block" />
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/10 transition-colors">
                        <td className="py-4 font-medium text-foreground flex items-center gap-2">
                          Firefox (Windows)
                          <span className="bg-muted text-[10px] px-1.5 py-0.5 rounded text-muted-foreground border border-border/50">
                            Current
                          </span>
                        </td>
                        <td className="py-4 text-muted-foreground">
                          Bojonegoro, East Java, ID
                        </td>
                        <td className="py-4 text-muted-foreground">
                          Jan 15, 2026, 10:23 AM
                        </td>
                        <td className="py-4 text-muted-foreground">
                          Mar 2, 2026, 8:04 AM
                        </td>
                        <td className="py-4 text-right">
                          <button className="text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4 inline-block" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "capabilities" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-foreground mb-8">
                Capabilities & Features
              </h2>

              <div className="space-y-8">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">
                      Web Search
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[85%] leading-relaxed">
                      Allow LyraAI to autonomously browse the internet to find
                      up-to-date information when your questions require current
                      events or factual accuracy.
                    </p>
                  </div>
                  <Switch
                    checked={searchEnabled}
                    onCheckedChange={setSearchEnabled}
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-t border-border/40 pt-6">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">
                      Image Generation
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[85%] leading-relaxed">
                      Enable the ability for LyraAI to generate images using
                      stable diffusion models when requested in chat.
                    </p>
                  </div>
                  <Switch checked={true} />
                </div>

                <div className="flex items-center justify-between py-2 border-t border-border/40 pt-6">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">
                      Code Interpreter
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[85%] leading-relaxed">
                      Allow the AI to write and execute Python code in a
                      sandboxed environment to solve math problems, analyze
                      data, or create files.
                    </p>
                  </div>
                  <Switch checked={false} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Bar for Save - Only visible when changes are made */}
      <div
        className={cn(
          "fixed bottom-8 right-8 md:bottom-12 md:right-12 z-50 transition-all duration-500 transform",
          isDirty || justSaved
            ? "translate-y-0 opacity-100"
            : "translate-y-12 opacity-0 pointer-events-none",
        )}
      >
        <Button
          onClick={handleSave}
          disabled={isSaving || justSaved}
          className={cn(
            "rounded-xl px-7 shadow-xl shadow-primary/20 text-[15px] font-medium h-[52px] flex items-center gap-3 overflow-hidden transition-all duration-300 relative",
            justSaved
              ? "bg-green-600 hover:bg-green-600 text-white"
              : "bg-[#6E42FD] hover:bg-[#5c37d6] text-white hover:-translate-y-1",
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : justSaved ? (
            <>
              <Check className="h-5 w-5 animate-in zoom-in" />
              Changes Saved
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
