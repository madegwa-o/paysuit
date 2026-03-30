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

        if (!testParams.commandId || !testParams.receiverShortCode || !testParams.amount || !testParams.accountReference) {
            return NextResponse.json(
                { error: "Missing required test parameters" },
                { status: 400 }
            )
        }

        const accessToken = await getAccessToken(credentials.consumerKey, credentials.consumerSecret)

        const b2bRequest = {
            Initiator: credentials.initiatorName,
            SecurityCredential: encodePassword(credentials.initiatorPassword),
            CommandID: testParams.commandId,
            SenderIdentifierType: "4",
            RecieverIdentifierType: "4",
            Amount: testParams.amount,
            PartyA: credentials.shortCode,
            PartyB: testParams.receiverShortCode,
            AccountReference: testParams.accountReference,
            Remarks: testParams.remarks || "B2B Test",
            QueueTimeOutURL: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/callbacks/b2b-timeout`,
            ResultURL: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/callbacks/b2b-result`,
        }

        const response = await fetch("https://sandbox.safaricom.co.ke/mpesa/b2b/v1/paymentrequest", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(b2bRequest),
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(
                { error: data.errorMessage || "B2B request failed" },
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
