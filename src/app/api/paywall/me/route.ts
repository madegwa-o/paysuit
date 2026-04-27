import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/db"
import { User } from "@/models/User"
import { Payment } from "@/models/Payment"

export async function GET() {
  const session = await getServerSession()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectToDatabase()

  const user = await User.findOne({ email: session.user.email }).select("walletBalance")
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const payments = await Payment.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .select("provider flow phoneNumber amount fee currency status createdAt resultCode resultDesc")

  return NextResponse.json({
    walletBalance: user.walletBalance || 0,
    payments,
  })
}
