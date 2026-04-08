"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, MoreHorizontal, Eye, EyeOff, Copy, Trash2,
  Loader2, Star, StarOff, Power, PowerOff, Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
  getAdminModels, createAdminModel, updateAdminModel, deleteAdminModel,
} from "@/lib/adminApi";

interface AIModel {
  id: string;
  name: string;
  provider: string;
  model_id: string;
  api_key: string;
  base_url: string;
  enabled: boolean;
  is_default: boolean;
  created_at: string;
}

const PROVIDER_PRESETS: Record<string, { base_url: string; placeholder: string }> = {
  "xAI": { base_url: "https://api.x.ai/v1", placeholder: "grok-4-1-fast-non-reasoning" },
  "OpenAI": { base_url: "https://api.openai.com/v1", placeholder: "gpt-4o" },
  "Anthropic": { base_url: "https://api.anthropic.com/v1", placeholder: "claude-3-5-sonnet-20241022" },
  "Google": { base_url: "https://generativelanguage.googleapis.com/v1beta", placeholder: "gemini-1.5-pro" },
  "Custom": { base_url: "", placeholder: "model-name" },
};

const emptyForm = {
  name: "",
  provider: "xAI",
  model_id: "",
  api_key: "",
  base_url: "https://api.x.ai/v1",
  is_default: false,
};

export default function APIKeysPage() {
  const { toast } = useToast();
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editModel, setEditModel] = useState<AIModel | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchModels = async () => {
    try {
      const data = await getAdminModels();
      setModels(data);
    } catch {
      toast({ title: "Failed to load models", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchModels(); }, []);

  const toggleVisible = (id: string) =>
    setVisibleKeys((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const maskKey = (key: string) =>
    key.slice(0, 8) + "••••••••••••" + key.slice(-4);

  const copyKey = (key: string, name: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Copied!", description: `API key for "${name}" copied.` });
  };

  const openAdd = () => {
    setEditModel(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (model: AIModel) => {
    setEditModel(model);
    setForm({
      name: model.name,
      provider: model.provider,
      model_id: model.model_id,
      api_key: model.api_key,
      base_url: model.base_url,
      is_default: model.is_default,
    });
    setDialogOpen(true);
  };

  const handleProviderChange = (provider: string) => {
    const preset = PROVIDER_PRESETS[provider] ?? PROVIDER_PRESETS.Custom;
    setForm((f) => ({ ...f, provider, base_url: preset.base_url }));
  };

  const handleSave = async () => {
    if (!form.name || !form.model_id || !form.api_key || !form.base_url) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editModel) {
        await updateAdminModel(editModel.id, form);
        toast({ title: "Model updated" });
      } else {
        await createAdminModel(form);
        toast({ title: "Model added" });
      }
      setDialogOpen(false);
      fetchModels();
    } catch {
      toast({ title: "Failed to save model", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = async (model: AIModel) => {
    try {
      await updateAdminModel(model.id, { enabled: !model.enabled });
      toast({ title: model.enabled ? "Model disabled" : "Model enabled" });
      fetchModels();
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const handleSetDefault = async (model: AIModel) => {
    if (model.is_default) return;
    try {
      await updateAdminModel(model.id, { is_default: true });
      toast({ title: `"${model.name}" set as default model` });
      fetchModels();
    } catch {
      toast({ title: "Failed to set default", variant: "destructive" });
    }
  };

  const handleDelete = async (model: AIModel) => {
    try {
      await deleteAdminModel(model.id);
      toast({ title: "Model deleted", variant: "destructive" });
      fetchModels();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Models</h1>
            <p className="text-muted-foreground">
              Manage AI models and their API keys. Users can select from enabled models in chat.
            </p>
          </div>
          <Button className="gap-2" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add Model
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Models", value: models.length },
            { label: "Enabled", value: models.filter((m) => m.enabled).length },
            { label: "Disabled", value: models.filter((m) => !m.enabled).length },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Models Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Configured Models</h2>
            <p className="text-xs text-muted-foreground">{models.length} models</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : models.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No models configured. Add one to get started.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {models.map((model) => (
                <div key={model.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{model.name}</p>
                      {model.is_default && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          Default
                        </span>
                      )}
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        model.enabled
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {model.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{model.provider}</span>
                      <span>•</span>
                      <code className="font-mono">{model.model_id}</code>
                    </div>
                  </div>

                  {/* API Key */}
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-muted px-3 py-1.5 text-xs font-mono text-muted-foreground">
                      {visibleKeys.includes(model.id) ? model.api_key : maskKey(model.api_key)}
                    </code>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toggleVisible(model.id)}>
                      {visibleKeys.includes(model.id)
                        ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                        : <Eye className="h-3.5 w-3.5 text-muted-foreground" />}
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => copyKey(model.api_key, model.name)}>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </Button>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(model)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {!model.is_default && (
                        <DropdownMenuItem onClick={() => handleSetDefault(model)}>
                          <Star className="mr-2 h-4 w-4" />
                          Set as Default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleToggleEnabled(model)}>
                        {model.enabled
                          ? <><PowerOff className="mr-2 h-4 w-4" /> Disable</>
                          : <><Power className="mr-2 h-4 w-4" /> Enable</>}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(model)}
                        className="text-destructive focus:text-destructive"
                        disabled={model.is_default}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editModel ? "Edit Model" : "Add AI Model"}</DialogTitle>
            <DialogDescription>
              {editModel ? "Update model configuration." : "Add a new AI model with its API key."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Display Name */}
            <div className="grid gap-2">
              <Label>Display Name <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. Grok 4.1 Fast"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Provider */}
            <div className="grid gap-2">
              <Label>Provider</Label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(PROVIDER_PRESETS).map((p) => (
                  <button
                    key={p}
                    onClick={() => handleProviderChange(p)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                      form.provider === p
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Model ID */}
            <div className="grid gap-2">
              <Label>Model ID <span className="text-destructive">*</span></Label>
              <Input
                placeholder={PROVIDER_PRESETS[form.provider]?.placeholder ?? "model-id"}
                value={form.model_id}
                onChange={(e) => setForm({ ...form, model_id: e.target.value })}
                className="font-mono text-sm"
              />
            </div>

            {/* API Key */}
            <div className="grid gap-2">
              <Label>API Key <span className="text-destructive">*</span></Label>
              <Input
                type="password"
                placeholder="sk-..."
                value={form.api_key}
                onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                className="font-mono text-sm"
              />
            </div>

            {/* Base URL */}
            <div className="grid gap-2">
              <Label>Base URL <span className="text-destructive">*</span></Label>
              <Input
                placeholder="https://api.x.ai/v1"
                value={form.base_url}
                onChange={(e) => setForm({ ...form, base_url: e.target.value })}
                className="font-mono text-sm"
              />
            </div>

            {/* Set as Default */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-sm text-foreground">Set as default model</span>
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : editModel ? "Save Changes" : "Add Model"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}