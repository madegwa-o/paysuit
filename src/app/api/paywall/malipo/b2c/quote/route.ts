import { NextRequest, NextResponse } from "next/server"

function calculateB2CFee(amount: number) {
  if (amount <= 20) return 0
  if (amount <= 50) return 5

  const extraBands = Math.ceil((amount - 50) / 50)
  return 5 + extraBands * 5
}

export async function POST(req: NextRequest) {
  const { amount } = await req.json()
  const parsedAmount = Number(amount)

  if (!Number.isFinite(parsedAmount) || parsedAmount < 1) {
    return NextResponse.json({ error: "Amount must be at least 1." }, { status: 400 })
  }

  const roundedAmount = Math.trunc(parsedAmount)
  const fee = calculateB2CFee(roundedAmount)

  return NextResponse.json({
    amount: roundedAmount,
    fee,
    totalDebit: roundedAmount + fee,
    currency: "KES",
    tariff: "0-20 free, 21-50 = 5 KES, then +5 KES every extra 50 KES band",
  })
}
