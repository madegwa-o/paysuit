// components/ApiKeysManager.tsx
"use client";

import { useState, useEffect } from "react";
import { Key, Plus, Trash2, Copy, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApiKeyData {
    _id: string;
    label: string;
    prefix: string;
    lastUsed?: string;
    isActive: boolean;
    createdAt: string;
}

interface NewKeyResponse {
    id: string;
    label: string;
    prefix: string;
    rawKey: string;
    createdAt: string;
}

export default function ApiKeysManager() {
    const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newKeyLabel, setNewKeyLabel] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newlyCreatedKey, setNewlyCreatedKey] = useState<NewKeyResponse | null>(null);
    const [copiedKey, setCopiedKey] = useState(false);
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        fetchApiKeys();
    }, []);

    const fetchApiKeys = async () => {
        try {
            const res = await fetch("/api/user/apikeys");
            const data = await res.json();
            if (res.ok) {
                setApiKeys(data.apiKeys || []);
            }
        } catch (error) {
            console.error("Failed to fetch API keys:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateKey = async () => {
        if (!newKeyLabel.trim()) return;

        setCreating(true);
        try {
            const res = await fetch("/api/user/apikeys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ label: newKeyLabel }),
            });

            const data = await res.json();

            if (res.ok) {
                setNewlyCreatedKey(data.apiKey);
                setNewKeyLabel("");
                await fetchApiKeys();
            } else {
                alert(data.error || "Failed to create API key");
            }
        } catch (error) {
            console.error("Failed to create API key:", error);
            alert("Failed to create API key");
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteKey = async (keyId: string) => {
        try {
            const res = await fetch(`/api/user/apikeys?id=${keyId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                await fetchApiKeys();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete API key");
            }
        } catch (error) {
            console.error("Failed to delete API key:", error);
            alert("Failed to delete API key");
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(true);
            setTimeout(() => setCopiedKey(false), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    const handleCloseNewKeyDialog = () => {
        setNewlyCreatedKey(null);
        setShowKey(false);
        setCopiedKey(false);
    };

    if (loading) {
        return <div className="text-muted-foreground">Loading API keys...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Create API keys to integrate with external applications
                </p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Key
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create API Key</DialogTitle>
                            <DialogDescription>
                                Give your API key a descriptive name to remember where it&#39;s used.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="key-label">Label</Label>
                                <Input
                                    id="key-label"
                                    placeholder="e.g., Production Server, Mobile App"
                                    value={newKeyLabel}
                                    onChange={(e) => setNewKeyLabel(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={handleCreateKey}
                                disabled={creating || !newKeyLabel.trim()}
                            >
                                {creating ? "Creating..." : "Create API Key"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Show newly created key */}
            {newlyCreatedKey && (
                <Alert className="border-primary bg-primary/10">
                    <Key className="h-4 w-4" />
                    <AlertDescription>
                        <div className="space-y-3">
                            <p className="font-semibold text-primary">
                                API Key Created Successfully!
                            </p>
                            <p className="text-sm">
                                Save this key somewhere safe. You won&#39;t be able to see it again!
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-background border rounded p-2 font-mono text-xs break-all">
                                    {showKey ? newlyCreatedKey.rawKey : "•".repeat(60)}
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowKey(!showKey)}
                                >
                                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(newlyCreatedKey.rawKey)}
                                >
                                    {copiedKey ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCloseNewKeyDialog}
                                className="w-full"
                            >
                                I&#39;ve saved my key
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* List of API keys */}
            <div className="space-y-3">
                {apiKeys.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Key className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No API keys yet</p>
                        <p className="text-sm">Create one to get started</p>
                    </div>
                ) : (
                    apiKeys.map((key) => (
                        <div
                            key={key._id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium">{key.label}</p>
                                    {key.isActive ? (
                                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded">
                                            Inactive
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground font-mono mt-1">
                                    {key.prefix}...
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Created: {new Date(key.createdAt).toLocaleDateString()}
                                    {key.lastUsed && (
                                        <> • Last used: {new Date(key.lastUsed).toLocaleDateString()}</>
                                    )}
                                </p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete &#34;{key.label}&#34;? This action
                                            cannot be undone and will immediately revoke access for any
                                            applications using this key.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleDeleteKey(key._id)}
                                            className="bg-destructive text-destructive-foreground"
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}