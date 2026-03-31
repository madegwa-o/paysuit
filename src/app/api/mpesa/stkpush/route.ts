import { NextRequest, NextResponse } from "next/server"

type Env = "sandbox" | "production"

interface StkPushRoutePayload {
  env?: Env
  accessToken?: string
  shortCode?: string
  passkey?: string
  transactionType?: "CustomerPayBillOnline" | "CustomerBuyGoodsOnline"
  amount?: string
  partyA?: string
  partyB?: string
  phoneNumber?: string
  callbackUrl?: string
  accountReference?: string
  transactionDesc?: string
}

const BASE_BY_ENV: Record<Env, string> = {
  sandbox: "https://sandbox.safaricom.co.ke",
  production: "https://api.safaricom.co.ke",
}

const timestamp = () => new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14)

const getPassword = (shortCode: string, passkey: string, ts: string) =>
  Buffer.from(`${shortCode}${passkey}${ts}`).toString("base64")

export async function POST(req: NextRequest) {
  const body = (await req.json()) as StkPushRoutePayload

  const env: Env = body.env === "production" ? "production" : "sandbox"
  const token = body.accessToken?.trim()
  const shortCode = body.shortCode?.trim()
  const passkey = body.passkey?.trim()

  if (!token || !shortCode || !passkey) {
    return NextResponse.json(
      { errorMessage: "Missing required auth fields (accessToken, shortCode, passkey)." },
      { status: 400 },
    )
  }

  const ts = timestamp()
  const payload = {
    BusinessShortCode: Number(shortCode),
    Password: getPassword(shortCode, passkey, ts),
    Timestamp: ts,
    TransactionType: body.transactionType ?? "CustomerPayBillOnline",
    Amount: body.amount ?? "1",
    PartyA: body.partyA ?? "",
    PartyB: body.partyB ?? shortCode,
    PhoneNumber: body.phoneNumber ?? "",
    CallBackURL: body.callbackUrl ?? "",
    AccountReference: (body.accountReference ?? "").slice(0, 12),
    TransactionDesc: (body.transactionDesc ?? "").slice(0, 13),
  }

  try {
    console.log(`fetching from: ${BASE_BY_ENV[env]}/mpesa/stkpush/v1/processrequest`)

    const response = await fetch(`${BASE_BY_ENV[env]}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    console.log("stk response: ", data)
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("STK push route error:", error)
    return NextResponse.json({ errorMessage: "Failed to connect to Safaricom STK endpoint." }, { status: 500 })
  }
}
