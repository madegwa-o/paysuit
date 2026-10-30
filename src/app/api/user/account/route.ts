import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/db"
import { User } from "@/models/User"
import { deleteUserAccount } from "@/lib/delete-user"

export async function DELETE() {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    await connectToDatabase()
    const user = await User.findOne({ email: session.user.email }).select("_id")
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
    await deleteUserAccount(user._id)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("delete account:", e)
    return NextResponse.json({ error: "Could not delete account. Please try again." }, { status: 500 })
  }
}