"use client";

import { useWs } from "@/hooks/ws-provider";

export type { ChatMessage, WsStatus as ChatStatus } from "@/hooks/ws-provider";

// Same shape as before, so <Chat /> doesn't change. The socket now lives in WsProvider.
export function useChat() {
    const { messages, status, send } = useWs();
    return { messages, status, send };
}