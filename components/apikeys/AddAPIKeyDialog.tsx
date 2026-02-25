"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export interface APIKey {
    id: string;
    name: string;
    key: string;
    type: "publishable" | "secret";
    createdAt: string;
    canDelete: boolean;
}

interface AddAPIKeyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddKey: (key: APIKey) => void;
}

export function AddAPIKeyDialog({ open, onOpenChange, onAddKey }: AddAPIKeyDialogProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: "",
        type: "secret" as "publishable" | "secret",
    });

    const generateAPIKey = (type: "publishable" | "secret"): string => {
        const prefix = type === "publishable" ? "pk_live_" : "sk_live_";
        const randomString = Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
        return prefix + btoa(randomString).substring(0, 24);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            toast({
                title: "Validation Error",
                description: "Please enter a name for the API key.",
                variant: "destructive",
            });
            return;
        }

        const newKey: APIKey = {
            id: Date.now().toString(),
            name: formData.name,
            key: generateAPIKey(formData.type),
            type: formData.type,
            createdAt: new Date().toISOString(),
            canDelete: true,
        };

        onAddKey(newKey);

        toast({
            title: "API Key Created",
            description: `${formData.type === "publishable" ? "Publishable" : "Secret"} key "${formData.name}" has been created.`,
        });

        setFormData({ name: "", type: "secret" });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New API Key</DialogTitle>
                    <DialogDescription>
                        Generate a new API key for your application. Keep it secure!
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Key Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g., Production API Key"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type">Key Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: "publishable" | "secret") =>
                                    setFormData({ ...formData, type: value })
                                }
                            >
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Select key type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="publishable">Publishable Key</SelectItem>
                                    <SelectItem value="secret">Secret Key</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {formData.type === "publishable"
                                    ? "Publishable keys can be safely used in client-side code."
                                    : "Secret keys should only be used on the server-side."}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">Create API Key</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
