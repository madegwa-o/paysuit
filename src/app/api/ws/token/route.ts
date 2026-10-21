import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export const dynamic = "force-dynamic";

// The WebSocket only validates the token at handshake, so a short TTL is fine.
// The client fetches a new one on every (re)connect.
const TTL_SECONDS = 120;

export async function GET() {
    const rawSecret = process.env.BACKEND_JWT_SECRET;
    if (!rawSecret) {
        console.error("BACKEND_JWT_SECRET is not set");
        return NextResponse.json({ error: "server misconfigured" }, { status: 500 });
    }

    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    console.log('currentUser: ', user);
    // Claim names match the Go `Claims` struct: username, email, roles, sub, iat, exp
    const token = await new SignJWT({
        username: user.username,
        email: user.email,
        roles: user.roles,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(user.id)
        .setIssuedAt()
        .setExpirationTime(`${TTL_SECONDS}s`)
        .sign(new TextEncoder().encode(rawSecret));

    return NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } });
}