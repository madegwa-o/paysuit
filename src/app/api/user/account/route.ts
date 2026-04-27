import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/db"
import { User } from "@/models/User"
import { Payment } from "@/models/Payment"
import { ApiKey } from "@/models/ApiKey"

export async function DELETE() {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectToDatabase()
  const user = await User.findOne({ email: session.user.email }).select("_id")
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  await Promise.all([
    Payment.deleteMany({ userId: user._id }),
    ApiKey.deleteMany({ userId: user._id }),
    User.deleteOne({ _id: user._id }),
  ])

  return NextResponse.json({ success: true })
}
