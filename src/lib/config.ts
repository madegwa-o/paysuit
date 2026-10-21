const base = process.env.NEXT_BACKEND_URL ?? "http://localhost:8080";

// ws://host:8080  -> ws://host:8080   (for WebSocket)
// ws://host:8080  -> http://host:8080 (for fetch)
// wss:// -> https:// is handled by the same replace
export const WS_BASE = base.replace(/\/$/, "");
export const HTTP_BASE = WS_BASE.replace(/^ws/, "http");

export const wsUrl = (path = "/ws") => `${WS_BASE}${path}`;
export const apiUrl = (path: string) => `${HTTP_BASE}${path}`;