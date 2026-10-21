// Returns null when the user isn't logged in; throws on network/server errors.
export async function fetchChatToken(): Promise<string | null> {
    const res = await fetch("/api/ws/token", { cache: "no-store" });
    if (res.status === 401) return null;
    if (!res.ok) throw new Error(`token request failed: ${res.status}`);
    const { token } = (await res.json()) as { token: string };
    return token;
}