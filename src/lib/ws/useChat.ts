"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { wsUrl } from "@/lib/config";
import { fetchChatToken } from "@/lib/ws/jwtToken";

export type ChatMessage = {
    id: string;
    userId?: string;
    username: string;
    text: string;
    ts: number;
};

export type ChatStatus = "connecting" | "open" | "closed" | "unauthenticated";

const MAX_BACKOFF_MS = 15_000;

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
export function useChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [status, setStatus] = useState<ChatStatus>("connecting");
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        let stopped = false;
        let attempt = 0;
        let timer: ReturnType<typeof setTimeout>;

        const scheduleRetry = () => {
            const delay = Math.min(1000 * 2 ** attempt++, MAX_BACKOFF_MS);
            timer = setTimeout(connect, delay);
        };

        const connect = async () => {
            setStatus("connecting");

            let token: string | null;
            try {
                token = await fetchChatToken();
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
                console.log("Received message", e);
                setMessages((prev) => [...prev, parseMessage(e.data)]);
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
    }, []);

    const send = useCallback((text: string) => {
        const ws = wsRef.current;
        const trimmed = text.trim();
        if (!trimmed || !ws || ws.readyState !== WebSocket.OPEN) return false;
        ws.send(JSON.stringify({ type: "message", text: trimmed }));
        return true;
    }, []);

    return { messages, status, send };
}