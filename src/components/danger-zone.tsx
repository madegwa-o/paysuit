"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    AlertDialog, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Action = "data" | "account"

const ACTIONS = {
    data: {
        url: "/api/user/data",
        button: "Delete My Data",
        title: "Delete all your data?",
        description:
            "This permanently deletes your transaction history, API keys, saved bank accounts, push subscriptions and payment settings. Your account stays active.",
    },
    account: {
        url: "/api/user/account",
        button: "Delete Account",
        title: "Delete your account?",
        description:
            "This permanently deletes your account and all associated data, and signs you out everywhere. It cannot be undone.",
    },
} as const

export function DangerZone() {
    const [action, setAction] = useState<Action | null>(null)
    const [confirmText, setConfirmText] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [done, setDone] = useState<string | null>(null)

    const close = () => {
        if (loading) return
        setAction(null)
        setConfirmText("")
        setError(null)
    }

    const run = async () => {
        if (!action) return
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(ACTIONS[action].url, { method: "DELETE" })
            if (!res.ok) {
                const d = await res.json().catch(() => ({}))
                throw new Error(d.error || "Request failed")
            }
            if (action === "account") {
                await signOut({ callbackUrl: "/" })
                return
            }
            setDone("Your data has been deleted.")
            setAction(null)
            setConfirmText("")
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions for your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {done && <Alert><AlertDescription>{done}</AlertDescription></Alert>}
                    {(Object.keys(ACTIONS) as Action[]).map((a) => (
                        <div key={a} className="flex items-center justify-between gap-4">
                            <div>
                                <p className="font-medium text-sm">{ACTIONS[a].title.replace("?", "")}</p>
                                <p className="text-muted-foreground text-xs">{ACTIONS[a].description}</p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => { setDone(null); setAction(a) }}>
                                {ACTIONS[a].button}
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <AlertDialog open={action !== null} onOpenChange={(o) => !o && close()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{action && ACTIONS[action].title}</AlertDialogTitle>
                        <AlertDialogDescription>{action && ACTIONS[action].description}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <p className="text-sm">Type <span className="font-mono font-semibold">DELETE</span> to confirm.</p>
                        <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} disabled={loading} autoComplete="off" />
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={close} disabled={loading}>Cancel</Button>
                        <Button variant="destructive" onClick={run} disabled={loading || confirmText !== "DELETE"}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : action && ACTIONS[action].button}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}