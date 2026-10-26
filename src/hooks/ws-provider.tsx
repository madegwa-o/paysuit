"use client";

import {
    createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import { useSession } from "next-auth/react";
import { wsUrl } from "@/lib/config";
import { fetchChatToken } from "@/lib/ws/jwtToken";
import {Payment} from "@/lib/payments";

export type ChatMessage = {
    id: string;
    userId?: string;
    username: string;
    text: string;
    ts: number;
};

export type WsStatus = "connecting" | "open" | "closed" | "unauthenticated";

type Ctx = {
    status: WsStatus;
    connected: boolean;
    messages: ChatMessage[];
    send: (text: string) => boolean;
    /** For non-chat consumers (e.g. payments later). Returns an unsubscribe fn. */
    subscribe: (fn: (m: ChatMessage) => void) => () => void;
    subscribePayments: (fn: (p: Payment) => void) => () => void;
};

const MAX_BACKOFF_MS = 15_000;
const MAX_MESSAGES = 500;

const WsContext = createContext<Ctx | null>(null);

export const useWs = () => {
    const c = useContext(WsContext);
    if (!c) throw new Error("useWs must be used inside <WsProvider>");
    return c;
};

function parseMessage(data: string): ChatMessage {
    try {
        const m = JSON.parse(data);
        return {
            id: crypto.randomUUID(),
            userId: m.fromId,
            username: m.from ?? "unknown",
            text: m.text ?? "",
            ts: m.sentAt ? new Date(m.sentAt).getTime() : Date.now(),
        };
    } catch {
        return { id: crypto.randomUUID(), username: "system", text: data, ts: Date.now() };
    }
}

export function WsProvider({ children }: { children: React.ReactNode }) {
    const { status: session } = useSession(); // "loading" | "authenticated" | "unauthenticated"
    const [status, setStatus] = useState<WsStatus>("connecting");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const wsRef = useRef<WebSocket | null>(null);
    const listeners = useRef(new Set<(m: ChatMessage) => void>());
    const paymentListeners = useRef(new Set<(p: Payment) => void>());

    useEffect(() => {
        if (session === "loading") return;
        if (session === "unauthenticated") {
            setStatus("unauthenticated");
            setMessages([]);
            return;
        }

        let stopped = false;
        let attempt = 0;
        let timer: ReturnType<typeof setTimeout>;

        const scheduleRetry = () => {
            timer = setTimeout(connect, Math.min(1000 * 2 ** attempt++, MAX_BACKOFF_MS));
        };

        const connect = async () => {
            setStatus("connecting");

            let token: string | null;
            try {
                token = await fetchChatToken(); // fresh token on every (re)connect
            } catch {
                if (!stopped) {
                    setStatus("closed");
                    scheduleRetry();
                }
                return;
            }
            if (stopped) return;
            if (!token) {
                setStatus("unauthenticated"); // session expired: don't retry
                return;
            }

            const ws = new WebSocket(`${wsUrl("/ws")}?token=${encodeURIComponent(token)}`);
            wsRef.current = ws;

            ws.onopen = () => {
                attempt = 0;
                setStatus("open");
            };
            ws.onmessage = (e) => {
                if (typeof e.data !== "string") return;

                let raw: any = null;
                try { raw = JSON.parse(e.data); } catch { /* not JSON: treat as chat text */ }

                if (raw?.type === "payment" && raw.payment) {
                    paymentListeners.current.forEach((fn) => {
                        try { fn(raw.payment as Payment); } catch { /* isolate subscribers */ }
                    });
                    return; // never shown as a chat message
                }

                const msg = parseMessage(e.data);
                setMessages((prev) => [...prev, msg].slice(-MAX_MESSAGES));
                listeners.current.forEach((fn) => {
                    try { fn(msg); } catch { /* isolate subscribers */ }
                });
            };
            ws.onclose = () => {
                if (stopped) return;
                setStatus("closed");
                scheduleRetry();
            };
            ws.onerror = () => ws.close();
        };

        connect();

        return () => {
            stopped = true;
            clearTimeout(timer);
            wsRef.current?.close();
            wsRef.current = null;
        };
    }, [session]);

    const send = useCallback((text: string) => {
        const ws = wsRef.current;
        const trimmed = text.trim();
        if (!trimmed || !ws || ws.readyState !== WebSocket.OPEN) return false;
        ws.send(JSON.stringify({ type: "message", text: trimmed }));
        return true;
    }, []);

    const subscribe = useCallback((fn: (m: ChatMessage) => void) => {
        listeners.current.add(fn);
        return () => { listeners.current.delete(fn); };
    }, []);

    const subscribePayments = useCallback((fn: (p: Payment) => void) => {
        paymentListeners.current.add(fn);
        return () => { paymentListeners.current.delete(fn); };
    }, []);

    const value = useMemo<Ctx>(
        () => ({ status, connected: status === "open", messages, send, subscribe, subscribePayments}),
        [status, messages, send, subscribe, subscribePayments],
    );

    return <WsContext.Provider value={value}>{children}</WsContext.Provider>;
}