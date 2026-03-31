// app/api/mpesa/auth/route.ts
// Proxies Daraja OAuth token generation to avoid CORS

import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const env = searchParams.get("env") || "sandbox"
    const credentials = searchParams.get("credentials") || ""

    const baseURL =
        env === "production"
            ? "https://api.safaricom.co.ke"
            : "https://sandbox.safaricom.co.ke"

    try {
        const response = await fetch(
            `${baseURL}/oauth/v1/generate?grant_type=client_credentials`,
            {
                method: "GET",
                headers: {
                    Authorization: `Basic ${credentials}`,
                    "Content-Type": "application/json",
                },
            }
        )

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error("Auth token error:", error)
        return NextResponse.json(
            { errorMessage: "Failed to connect to Safaricom OAuth endpoint." },
            { status: 500 }
        )
    }
}
