import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/db"
import { User } from "@/models/User"

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectToDatabase()
  const user = await User.findOne({ email: session.user.email }).select("name email phone")
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, phone } = await req.json()

  if (!name || String(name).trim().length < 2) {
    return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 })
  }

  if (phone && !/^[\d\s\-\+\(\)]+$/.test(String(phone))) {
    return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 })
  }

  await connectToDatabase()
  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    {
      $set: {
        name: String(name).trim(),
        phone: String(phone || "").trim() || null,
      },
    },
    { new: true, runValidators: true }
  ).select("name email phone")

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true, user })
}
