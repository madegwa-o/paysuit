"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useWs } from "@/hooks/ws-provider";
import {
    Payment, Provider, getPayment, getSettings, listPayments, sendPrompt, setProvider,
} from "@/lib/payments";

const PROVIDERS: Provider[] = ["MALIPO", "PAYSUIT"];
const STATUS_LABEL: Record<Payment["status"], string> = {
    PENDING: "⏳ Waiting for PIN",
    SUCCESS: "✅ Paid",
    FAILED: "❌ Failed",
    CANCELLED: "🚫 Cancelled",
};
const FRESH_MS = 180_000; // only keep checking payments newer than this

export default function PromptPanel() {
    const { subscribePayments, connected } = useWs();
    const [provider, setProviderState] = useState<Provider>("MALIPO");
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [phone, setPhone] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");

    const upsert = useCallback((p: Payment) => {
        setPayments((prev) =>
            prev.some((x) => x.id === p.id) ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev],
        );
    }, []);

    // Initial load: current provider + history
    useEffect(() => {
        (async () => {
            try {
                const [settings, history] = await Promise.all([getSettings(), listPayments()]);
                setProviderState(settings.paymentProvider || "MALIPO");
                setPayments(history);
            } catch (e) {
                setLoadError(e instanceof Error ? e.message : "Could not load");
            }
        })();
    }, []);

    // Live results pushed over the global WebSocket
    useEffect(
        () =>
            subscribePayments((p) => {
                upsert(p);
                if (p.status === "SUCCESS") toast.success(`KES ${p.amount} received · ${p.mpesaReceipt ?? ""}`, { id: p.id });
                else if (p.status === "CANCELLED") toast.info("The customer cancelled the prompt", { id: p.id });
                else if (p.status === "FAILED") toast.error(p.resultDesc || "Payment failed", { id: p.id });
            }),
        [subscribePayments, upsert],
    );

    // Backup: re-check recent pending payments in case a socket event was missed
    const pendingIds = payments
        .filter((p) => p.status === "PENDING" && Date.now() - Date.parse(p.createdAt) < FRESH_MS)
        .map((p) => p.id)
        .join(",");
    useEffect(() => {
        if (!pendingIds) return;
        const t = setInterval(async () => {
            for (const id of pendingIds.split(",")) {
                try { upsert(await getPayment(id)); } catch { /* try again next tick */ }
            }
        }, 5000);
        return () => clearInterval(t);
    }, [pendingIds, upsert]);

    async function choose(next: Provider) {
        if (next === provider) return;
        const prev = provider;
        setProviderState(next); // optimistic
        try {
            await setProvider(next);
            toast.success(`Prompts will now be sent from ${next}`);
        } catch (e) {
            setProviderState(prev);
            toast.error(e instanceof Error ? e.message : "Could not change provider");
        }
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSending(true);
        try {
            const p = await sendPrompt({
                phoneNumber: phone,
                amount: Math.floor(Number(amount)),
                description: description || undefined,
            });
            upsert(p);
            setAmount("");
            toast.success("Prompt sent. Ask the customer to enter their M-Pesa PIN.");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not send the prompt");
        } finally {
            setSending(false);
        }
    }

    if (loadError) {
        return <p className="rounded-md border p-3 text-sm text-red-600">{loadError}</p>;
    }

    return (
        <div className="space-y-5">
            {/* Provider toggle */}
            <div>
                <p className="mb-1 text-xs text-muted-foreground">Send prompts from</p>
                <div className="grid grid-cols-2 gap-1 rounded-lg border p-1">
                    {PROVIDERS.map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => choose(p)}
                            className={`rounded-md py-2 text-sm font-medium ${
                                provider === p ? "bg-green-600 text-white" : "hover:bg-muted"
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Prompt form */}
            <form onSubmit={onSubmit} className="space-y-3">
                <input
                    className="w-full rounded-md border bg-background p-2"
                    placeholder="Customer phone (07XX XXX XXX)"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                />
                <input
                    className="w-full rounded-md border bg-background p-2"
                    placeholder="Amount (KES)"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={250000}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
                <input
                    className="w-full rounded-md border bg-background p-2"
                    placeholder="Description (max 13 chars)"
                    maxLength={13}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={sending}
                    className="w-full rounded-md bg-green-600 p-2 font-medium text-white disabled:opacity-50"
                >
                    {sending ? "Sending…" : "Send payment prompt"}
                </button>
            </form>

            {/* History + live status */}
            <div>
                <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Recent prompts</h2>
                    <span className={`text-xs ${connected ? "text-green-600" : "text-amber-600"}`}>
                        {connected ? "● Live" : "Reconnecting…"}
                    </span>
                </div>
                <ul className="space-y-2">
                    {payments.length === 0 && <li className="text-sm text-muted-foreground">No prompts yet.</li>}
                    {payments.map((p) => (
                        <li key={p.id} className="rounded-md border p-3 text-sm">
                            <div className="flex justify-between">
                                <span className="font-medium">KES {p.amount}</span>
                                <span>{STATUS_LABEL[p.status]}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {p.phone} · {p.provider} · ref {p.accountReference}
                                {p.mpesaReceipt ? ` · ${p.mpesaReceipt}` : ""}
                            </p>
                            {p.status === "FAILED" && p.resultDesc && (
                                <p className="text-xs text-red-600">{p.resultDesc}</p>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}