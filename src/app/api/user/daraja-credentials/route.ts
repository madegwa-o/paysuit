import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/db"
import { User } from "@/models/User"

type Environment = "sandbox" | "production"

const isEnvironment = (value: string): value is Environment => value === "sandbox" || value === "production"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const envParam = req.nextUrl.searchParams.get("env") ?? "sandbox"
    if (!isEnvironment(envParam)) {
      return NextResponse.json({ error: "Invalid environment" }, { status: 400 })
    }

    await connectToDatabase()

    const user = await User.findOne({ email: session.user.email }).lean<{
      darajaCredentials?: {
        sandbox?: Record<string, string>
        production?: Record<string, string>
      }
    } | null>()

    return NextResponse.json({
      environment: envParam,
      credentials: user?.darajaCredentials?.[envParam] ?? null,
    })
  } catch (error) {
    console.error("Get Daraja credentials error:", error)
    return NextResponse.json({ error: "Failed to fetch saved credentials" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const env = body.environment

    if (!isEnvironment(env)) {
      return NextResponse.json({ error: "Invalid environment" }, { status: 400 })
    }

    await connectToDatabase()

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          [`darajaCredentials.${env}.consumerKey`]: String(body.consumerKey ?? ""),
          [`darajaCredentials.${env}.consumerSecret`]: String(body.consumerSecret ?? ""),
          [`darajaCredentials.${env}.passkey`]: String(body.passkey ?? ""),
          [`darajaCredentials.${env}.initiatorName`]: String(body.initiatorName ?? ""),
          [`darajaCredentials.${env}.shortCode`]: String(body.shortCode ?? ""),
        },
      },
      { new: true, runValidators: true }
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: `Saved ${env} Daraja credentials` })
  } catch (error) {
    console.error("Save Daraja credentials error:", error)
    return NextResponse.json({ error: "Failed to save credentials" }, { status: 500 })
  }
}
