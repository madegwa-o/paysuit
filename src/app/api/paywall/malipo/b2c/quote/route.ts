import { NextRequest, NextResponse } from "next/server"
import { calculatePaywallFee } from "@/lib/paywall-fees"

export async function POST(req: NextRequest) {
  const { amount } = await req.json()
  const parsedAmount = Number(amount)

  if (!Number.isFinite(parsedAmount) || parsedAmount < 1) {
    return NextResponse.json({ error: "Amount must be at least 1." }, { status: 400 })
  }

  const roundedAmount = Math.trunc(parsedAmount)
  const fee = calculatePaywallFee(roundedAmount)

  return NextResponse.json({
    amount: roundedAmount,
    fee,
    totalDebit: roundedAmount + fee,
    currency: "KES",
    tariff: "Calculated from pricing page fee bands.",
  })
}
