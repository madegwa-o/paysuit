import { NextRequest, NextResponse } from "next/server"

async function getAccessToken(consumerKey: string, consumerSecret: string) {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")
    
    try {
        const response = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
            method: "GET",
            headers: {
                Authorization: `Basic ${auth}`,
            },
        })

        if (!response.ok) {
            throw new Error("Failed to get access token")
        }

        const data = await response.json()
        return data.access_token
    } catch (error) {
        throw new Error("Authentication failed. Check your credentials.")
    }
}

function encodePassword(password: string) {
    return Buffer.from(password).toString("base64")
}

export async function POST(request: NextRequest) {
    try {
        const { credentials, testParams } = await request.json()

        if (!credentials.consumerKey || !credentials.consumerSecret || !credentials.initiatorName || !credentials.initiatorPassword || !credentials.shortCode) {
            return NextResponse.json(
                { error: "Missing required credentials" },
                { status: 400 }
            )
        }

        if (!testParams.checkoutRequestId) {
            return NextResponse.json(
                { error: "Checkout Request ID is required" },
                { status: 400 }
            )
        }

        const accessToken = await getAccessToken(credentials.consumerKey, credentials.consumerSecret)

        const statusRequest = {
            Initiator: credentials.initiatorName,
            SecurityCredential: encodePassword(credentials.initiatorPassword),
            CommandID: "TransactionStatusQuery",
            TransactionID: testParams.checkoutRequestId,
            PartyA: credentials.shortCode,
            IdentifierType: testParams.identifierType || "4",
            ResultURL: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/callbacks/status-result`,
            QueueTimeOutURL: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/callbacks/status-timeout`,
            Remarks: testParams.remarks || "Status check",
        }

        const response = await fetch("https://sandbox.safaricom.co.ke/mpesa/transactionstatus/v1/query", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(statusRequest),
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(
                { error: data.errorMessage || "Transaction status query failed" },
                { status: response.status }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error"
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}
