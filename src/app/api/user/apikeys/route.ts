// app/api/user/apikeys/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import { ApiKey } from "@/models/ApiKey";
import { User } from "@/models/User";
import { generateApiKey } from "@/lib/apikey-utils";

// GET - Fetch all API keys for the current user
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Fetch all API keys for this user
        const apiKeys = await ApiKey.find({ userId: user._id })
            .select("-key") // Don't send the hashed key
            .sort({ createdAt: -1 });

        return NextResponse.json({ apiKeys });
    } catch (error) {
        console.error("GET API keys error:", error);
        return NextResponse.json(
            { error: "Failed to fetch API keys" },
            { status: 500 }
        );
    }
}

// POST - Create a new API key
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { label } = body;

        if (!label || label.trim().length === 0) {
            return NextResponse.json(
                { error: "Label is required" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Generate new API key
        const { rawKey, hashedKey, prefix } = generateApiKey();

        // Create API key in database
        const apiKey = await ApiKey.create({
            userId: user._id,
            label: label.trim(),
            key: hashedKey,
            prefix,
        });

        // Add reference to user's apikeys array
        await User.findByIdAndUpdate(user._id, {
            $push: { apikeys: apiKey._id },
        });

        // Return the raw key ONLY ONCE - user must save it
        return NextResponse.json({
            success: true,
            message: "API key created successfully. Save this key - it won't be shown again!",
            apiKey: {
                id: apiKey._id,
                label: apiKey.label,
                prefix: apiKey.prefix,
                rawKey, // Only returned on creation
                createdAt: apiKey.createdAt,
            },
        });
    } catch (error) {
        console.error("POST API key error:", error);
        return NextResponse.json(
            { error: "Failed to create API key" },
            { status: 500 }
        );
    }
}

// DELETE - Delete an API key
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const keyId = searchParams.get("id");

        if (!keyId) {
            return NextResponse.json(
                { error: "API key ID is required" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Find and delete the API key (ensure it belongs to this user)
        const apiKey = await ApiKey.findOneAndDelete({
            _id: keyId,
            userId: user._id,
        });

        if (!apiKey) {
            return NextResponse.json(
                { error: "API key not found" },
                { status: 404 }
            );
        }

        // Remove reference from user's apikeys array
        await User.findByIdAndUpdate(user._id, {
            $pull: { apikeys: keyId },
        });

        return NextResponse.json({
            success: true,
            message: "API key deleted successfully",
        });
    } catch (error) {
        console.error("DELETE API key error:", error);
        return NextResponse.json(
            { error: "Failed to delete API key" },
            { status: 500 }
        );
    }
}