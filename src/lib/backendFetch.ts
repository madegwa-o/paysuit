import { apiUrl } from "@/lib/config";
import { fetchChatToken } from "@/lib/ws/jwtToken";

// A fresh token per call (the token route is same-origin and cheap).
// Deliberately NOT cached: a module-level cache would survive a logout/login
// and could send the next user's request with the previous user's token.
export async function backendFetch<T>(
    path: string,
    init: { method?: string; body?: unknown } = {},
): Promise<T> {
    const token = await fetchChatToken();
    if (!token) throw new Error("Please sign in to continue");

    const res = await fetch(apiUrl(path), {
        method: init.method ?? "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
        cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
    return data as T;
}