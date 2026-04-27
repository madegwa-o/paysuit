import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/db"
import { Payment } from "@/models/Payment"
import { User } from "@/models/User"

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
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { phoneNumber, amount } = await req.json()

  const formattedPhone = normalizePhone(String(phoneNumber || ""))
  const parsedAmount = Number(amount)

  if (!formattedPhone) {
    return NextResponse.json({ error: "Use a valid Safaricom number (07XXXXXXXX or 2547XXXXXXXX)." }, { status: 400 })
  }

  if (!Number.isFinite(parsedAmount) || parsedAmount < 1) {
    return NextResponse.json({ error: "Amount must be at least 1." }, { status: 400 })
  }

  const consumerKey = process.env.PAYSUIT_CONSUMER_KEY
  const consumerSecret = process.env.PAYSUIT_CONSUMER_SECRET
  const shortCode = process.env.PAYSUIT_SHORTCODE
  const passkey = process.env.PAYSUIT_PASSKEY

  if (!consumerKey || !consumerSecret || !shortCode || !passkey) {
    return NextResponse.json({ error: "Paysuit C2B credentials are not configured on the server." }, { status: 500 })
  }

  await connectToDatabase()
  const dbUser = await User.findOne({ email: session.user.email })
  if (!dbUser) {
    return NextResponse.json({ error: "User account not found." }, { status: 404 })
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
        AccountReference: "PAYSUITTOPUP",
        TransactionDesc: `Topup-${String(dbUser._id).slice(-6)}`.slice(0, 13),
      }),
    })

    const data = await stkResponse.json()

    await Payment.create({
      userId: dbUser._id,
      provider: "PAYSUIT",
      flow: "PAYSUIT_RECHARGE",
      phoneNumber: formattedPhone,
      amount: Math.trunc(parsedAmount),
      fee: 0,
      status: stkResponse.ok ? "PENDING" : "FAILED",
      merchantRequestID: data?.MerchantRequestID,
      checkoutRequestID: data?.CheckoutRequestID,
      resultDesc: data?.ResponseDescription || data?.errorMessage,
      rawResponse: data,
    })

    return NextResponse.json(data, { status: stkResponse.status })
  } catch (error) {
    console.error("Paysuit recharge STK error", error)
    return NextResponse.json({ error: "Unable to initiate Paysuit recharge." }, { status: 500 })
  }
}
