import { NextRequest, NextResponse } from "next/server"

// Helper to get access token from Daraja
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

// Helper to get timestamp
function getTimestamp() {
    return new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14)
}

// Helper to generate password (Base64 encoding of shortCode+passkey+timestamp)
function generatePassword(shortCode: string, passkey: string, timestamp: string) {
    const password = `${shortCode}${passkey}${timestamp}`
    return Buffer.from(password).toString("base64")
}

export async function POST(request: NextRequest) {
    try {
        const { credentials, testParams } = await request.json()

        // Validate inputs
        if (!credentials.consumerKey || !credentials.consumerSecret || !credentials.shortCode || !credentials.passkey) {
            return NextResponse.json(
                { error: "Missing required credentials" },
                { status: 400 }
            )
        }

        if (!testParams.phoneNumber || !testParams.amount || !testParams.accountReference) {
            return NextResponse.json(
                { error: "Missing required test parameters" },
                { status: 400 }
            )
        }

        // Get access token
        const accessToken = await getAccessToken(credentials.consumerKey, credentials.consumerSecret)

        // Prepare STK Push request
        const timestamp = getTimestamp()
        const password = generatePassword(credentials.shortCode, credentials.passkey, timestamp)

        const stkPushRequest = {
            BusinessShortCode: credentials.shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: testParams.amount,
            PartyA: testParams.phoneNumber,
            PartyB: credentials.shortCode,
            PhoneNumber: testParams.phoneNumber,
            CallBackURL: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/callbacks/stk-push`,
            AccountReference: testParams.accountReference,
            TransactionDesc: testParams.transactionDescription || "STK Push Test",
        }

        // Call Daraja API
        const response = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(stkPushRequest),
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(
                { error: data.errorMessage || "STK Push failed" },
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
