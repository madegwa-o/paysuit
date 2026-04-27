import { NextRequest, NextResponse } from "next/server"

const MPESA_BASE_URL = process.env.DARAJA_BASE_URL || "https://api.safaricom.co.ke"

const timestamp = () => new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14)

const normalizePhone = (phone: string) => {
  const trimmed = phone.replace(/\s+/g, "")
  if (/^2547\d{8}$/.test(trimmed)) return trimmed
  if (/^07\d{8}$/.test(trimmed)) return `254${trimmed.slice(1)}`
  return null
}

const getStkPassword = (shortCode: string, passkey: string, ts: string) =>
  Buffer.from(`${shortCode}${passkey}${ts}`).toString("base64")

async function getAccessToken(consumerKey: string, consumerSecret: string) {
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")
  const response = await fetch(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
  })

  const data = await response.json()
  return { ok: response.ok, status: response.status, data }
}

export async function POST(req: NextRequest) {
  const { phoneNumber, amount } = await req.json()

  const formattedPhone = normalizePhone(String(phoneNumber || ""))
  const parsedAmount = Number(amount)

  if (!formattedPhone) {
    return NextResponse.json({ error: "Use a valid Safaricom number (07XXXXXXXX or 2547XXXXXXXX)." }, { status: 400 })
  }

  if (!Number.isFinite(parsedAmount) || parsedAmount < 1) {
    return NextResponse.json({ error: "Amount must be at least 1." }, { status: 400 })
  }

  const consumerKey = process.env.MALIPO_CONSUMER_KEY
  const consumerSecret = process.env.MALIPO_CONSUMER_SECRET
  const shortCode = process.env.MALIPO_SHORTCODE
  const passkey = process.env.MALIPO_PASSKEY

  if (!consumerKey || !consumerSecret || !shortCode || !passkey) {
    return NextResponse.json({ error: "Malipo C2B credentials are not configured on the server." }, { status: 500 })
  }

  try {
    const tokenResult = await getAccessToken(consumerKey, consumerSecret)
    if (!tokenResult.ok) {
      return NextResponse.json({ error: "Failed to generate access token.", details: tokenResult.data }, { status: tokenResult.status })
    }

    const accessToken = tokenResult.data?.access_token
    const ts = timestamp()

    const stkResponse = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: Number(shortCode),
        Password: getStkPassword(shortCode, passkey, ts),
        Timestamp: ts,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.trunc(parsedAmount),
        PartyA: formattedPhone,
        PartyB: Number(shortCode),
        PhoneNumber: formattedPhone,
        CallBackURL: `${process.env.CALLBACK_BASE_URL || "http://localhost:3000"}/api/mpesa/stkpush/callback`,
        AccountReference: "MALIPOC2B",
        TransactionDesc: "Malipo C2B",
      }),
    })

    const data = await stkResponse.json()
    return NextResponse.json(data, { status: stkResponse.status })
  } catch (error) {
    console.error("Malipo C2B STK error", error)
    return NextResponse.json({ error: "Unable to initiate Malipo C2B payment." }, { status: 500 })
  }
}
