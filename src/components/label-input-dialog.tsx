"use client"

import { useState } from "react"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LabelInputDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (label: string) => Promise<void>
    isLoading?: boolean
    error?: string
}

export function LabelInputDialog({ open, onOpenChange, onSave, isLoading = false, error }: LabelInputDialogProps) {
    const [label, setLabel] = useState("")

    const handleSave = async () => {
        if (!label.trim()) return
        await onSave(label.trim())
        setLabel("")
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!isLoading) {
            onOpenChange(newOpen)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Image Label</DialogTitle>
                    <DialogDescription>Give your image a descriptive name to organize your gallery</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="imageLabel">Label</Label>
                        <Input
                            id="imageLabel"
                            placeholder="e.g., Product Photo, Logo, Banner"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            disabled={isLoading}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !isLoading && label.trim()) {
                                    handleSave()
                                }
                            }}
                        />
                        <p className="text-xs text-muted-foreground mt-1">{label.length}/100 characters</p>
                    </div>
                    {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">{error}</div>}
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading || !label.trim()}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Image
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
