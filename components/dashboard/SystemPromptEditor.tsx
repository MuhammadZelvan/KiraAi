"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getAdminSystemPrompt, updateAdminSystemPrompt } from "@/lib/adminApi";
import { Save, RotateCcw, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export function SystemPromptEditor() {
  const [content, setContent] = useState("");
  const [original, setOriginal] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const isDirty = content !== original;
  const charCount = content.length;
  const lineCount = content.split("\n").length;

  useEffect(() => {
    getAdminSystemPrompt()
      .then((res) => {
        setContent(res.content);
        setOriginal(res.content);
      })
      .catch(() =>
        toast({ title: "Failed to load system prompt", variant: "destructive" })
      )
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!content.trim()) {
      toast({ title: "Prompt cannot be empty", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await updateAdminSystemPrompt(content);
      setOriginal(content);
      toast({ title: "System prompt updated", description: "Changes will apply to new conversations." });
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setContent(original);
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">System Prompt</CardTitle>
              <p className="text-sm text-muted-foreground">
                Controls how Lyra behaves for all users
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isDirty && (
              <span className="text-xs text-warning font-medium px-2 py-1 rounded-full bg-warning/10 border border-warning/20">
                Unsaved changes
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
              onClick={handleReset}
              disabled={!isDirty || saving}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button
              size="sm"
              className="gap-2 text-xs"
              onClick={handleSave}
              disabled={!isDirty || saving}
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex h-[400px] items-center justify-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : (
          <>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={cn(
                "w-full resize-none bg-transparent p-5 font-mono text-sm text-foreground",
                "placeholder:text-muted-foreground focus:outline-none",
                "min-h-[400px]"
              )}
              placeholder="Write your system prompt here..."
              spellCheck={false}
            />
            <div className="flex items-center justify-between border-t border-border px-5 py-2.5 text-xs text-muted-foreground">
              <span>{lineCount} lines</span>
              <span>{charCount.toLocaleString()} characters</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}