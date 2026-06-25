import { randomUUID } from "crypto"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function POST() {
  const session = await getServerSession()
  const userId = session?.user?.email

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  return NextResponse.json({
    websocketSessionId: randomUUID(),
    expiresInSeconds: 300,
  })
}
