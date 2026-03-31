import { NextRequest, NextResponse } from "next/server"

interface StkCallbackPayload {
  Body?: {
    stkCallback?: {
      MerchantRequestID?: string
      CheckoutRequestID?: string
      ResultCode?: number | string
      ResultDesc?: string
      CallbackMetadata?: {
        Item?: Array<{ Name?: string; Value?: string | number }>
      }
    }
  }
}

export async function POST(req: NextRequest) {
  let payload: StkCallbackPayload

  try {
    payload = (await req.json()) as StkCallbackPayload
  } catch {
    return NextResponse.json({ errorMessage: "Invalid callback payload JSON." }, { status: 400 })
  }

  const callback = payload.Body?.stkCallback
  if (!callback) {
    return NextResponse.json({ errorMessage: "Missing Body.stkCallback in callback payload." }, { status: 400 })
  }

  console.log("STK callback received:", callback)

  return NextResponse.json(
    {
      ResultCode: 0,
      ResultDesc: "Callback received successfully",
    },
    { status: 200 },
  )
}

export async function GET() {
  return NextResponse.json(
    {
      message: "STK callback endpoint is active. Send Safaricom callback payloads via POST.",
      expectedPath: "/api/mpesa/stkpush/callback",
    },
    { status: 200 },
  )
}
