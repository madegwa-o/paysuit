// app/api/test_credentials/route.ts
// Generic proxy for ALL Daraja API endpoints — avoids CORS

import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const targetUrl = searchParams.get("url")

    if (!targetUrl) {
        return NextResponse.json({ errorMessage: "Missing target URL" }, { status: 400 })
    }

    // Security: only allow Safaricom domains
    const allowed = ["sandbox.safaricom.co.ke", "api.safaricom.co.ke"]
    try {
        const hostname = new URL(targetUrl).hostname
        if (!allowed.includes(hostname)) {
            return NextResponse.json({ errorMessage: "Disallowed target domain" }, { status: 403 })
        }
    } catch {
        return NextResponse.json({ errorMessage: "Invalid URL" }, { status: 400 })
    }

    const authHeader = req.headers.get("Authorization")
    const body = await req.text()

    try {
        const response = await fetch(targetUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
            body,
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error("Proxy error:", error)
        return NextResponse.json(
            { errorMessage: "Failed to connect to Safaricom API." },
            { status: 500 }
        )
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const targetUrl = searchParams.get("url")

    if (!targetUrl) {
        return NextResponse.json({ errorMessage: "Missing target URL" }, { status: 400 })
    }

    const allowed = ["sandbox.safaricom.co.ke", "api.safaricom.co.ke"]
    try {
        const hostname = new URL(targetUrl).hostname
        if (!allowed.includes(hostname)) {
            return NextResponse.json({ errorMessage: "Disallowed target domain" }, { status: 403 })
        }
    } catch {
        return NextResponse.json({ errorMessage: "Invalid URL" }, { status: 400 })
    }

    const authHeader = req.headers.get("Authorization")

    try {
        const response = await fetch(targetUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error("Proxy error:", error)
        return NextResponse.json(
            { errorMessage: "Failed to connect to Safaricom API." },
            { status: 500 }
        )
    }
}