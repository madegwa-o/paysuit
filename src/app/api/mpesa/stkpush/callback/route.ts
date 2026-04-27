import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { Payment } from "@/models/Payment"
import { User } from "@/models/User"

interface StkMetadataItem {
  Name?: string
  Value?: string | number
}

interface StkCallbackPayload {
  Body?: {
    stkCallback?: {
      MerchantRequestID?: string
      CheckoutRequestID?: string
      ResultCode?: number | string
      ResultDesc?: string
      CallbackMetadata?: {
        Item?: StkMetadataItem[]
      }
    }
  }
}

function getMetadataValue(items: StkMetadataItem[] | undefined, key: string) {
  return items?.find((item) => item.Name === key)?.Value
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

  try {
    await connectToDatabase()

    const checkoutRequestID = callback.CheckoutRequestID
    const merchantRequestID = callback.MerchantRequestID
    const resultCode = Number(callback.ResultCode ?? -1)

    const payment = await Payment.findOne({
      $or: [
        ...(checkoutRequestID ? [{ checkoutRequestID }] : []),
        ...(merchantRequestID ? [{ merchantRequestID }] : []),
      ],
    })

    if (!payment) {
      console.warn("STK callback received for unknown transaction", callback)
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Callback received" }, { status: 200 })
    }

    const wasSuccessful = payment.status === "SUCCESS"
    payment.status = resultCode === 0 ? "SUCCESS" : "FAILED"
    payment.resultCode = resultCode
    payment.resultDesc = callback.ResultDesc
    payment.callbackPayload = payload as Record<string, unknown>

    if (checkoutRequestID) payment.checkoutRequestID = checkoutRequestID
    if (merchantRequestID) payment.merchantRequestID = merchantRequestID
    await payment.save()

    if (!wasSuccessful && resultCode === 0) {
      const amountFromCallback = Number(getMetadataValue(callback.CallbackMetadata?.Item, "Amount") || payment.amount)

      if (payment.flow === "PAYSUIT_RECHARGE") {
        await User.updateOne({ _id: payment.userId }, { $inc: { walletBalance: amountFromCallback } })
      }

      if (payment.flow === "MALIPO_C2B") {
        await User.updateOne({ _id: payment.userId }, { $inc: { accountBalance: amountFromCallback } })
      }
    }
  } catch (error) {
    console.error("STK callback processing error:", error)
  }

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
