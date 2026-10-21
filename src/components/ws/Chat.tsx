"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/lib/ws/useChat";

const STATUS_LABEL = {
    open: "Connected",
    connecting: "Connecting…",
    closed: "Reconnecting…",
    unauthenticated: "Signed out",
} as const;

export default function Chat({ userId }: { userId: string }) {
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);
    const { messages, status, send } = useChat();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (send(input)) setInput("");
    };

    if (status === "unauthenticated") {
        return (
            <p className="p-6 text-center">
                Your session has expired. <a className="underline" href="/auth/login?callbackUrl=/chat">Log in again</a>
            </p>
        );
    }

    return (
        <div className="mx-auto flex h-screen max-w-2xl flex-col border-x">
            <header className="flex items-center justify-between border-b px-4 py-3">
                <h1 className="font-semibold">Chat</h1>
                <span className={`text-xs ${status === "open" ? "text-green-600" : "text-amber-600"}`}>
                    {STATUS_LABEL[status]}
                </span>
            </header>

            <ul className="flex-1 space-y-2 overflow-y-auto p-4">
                {messages.map((m) => {
                    const mine = m.userId === userId;
                    return (
                        <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                                    mine ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                                }`}
                            >
                                {!mine && <p className="mb-0.5 text-xs font-medium opacity-70">{m.username}</p>}
                                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                                <p className="mt-1 text-right text-[10px] opacity-60">
                                    {new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                            </div>
                        </li>
                    );
                })}
                <div ref={bottomRef} />
            </ul>

            <form onSubmit={handleSubmit} className="flex gap-2 border-t p-3">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={status === "open" ? "Type a message…" : "Waiting for connection…"}
                    disabled={status !== "open"}
                    className="flex-1 rounded-full border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    disabled={status !== "open" || !input.trim()}
                    className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                    Send
                </button>
            </form>
        </div>
    );
}