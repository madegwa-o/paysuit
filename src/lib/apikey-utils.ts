// lib/apikey-utils.ts
import crypto from "crypto";
import { ApiKey } from "@/models/ApiKey";
import { connectToDatabase } from "@/lib/db";

/**
 * Generate a unique API key with format: mlp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 * mlp = Malipo prefix
 */
export function generateApiKey(): { rawKey: string; hashedKey: string; prefix: string } {
    // Generate 32 bytes of random data (will be 64 hex characters)
    const randomBytes = crypto.randomBytes(32).toString("hex");

    // Create the raw key with prefix
    const rawKey = `mlp_${randomBytes}`;

    // Hash the key for storage (using SHA-256)
    const hashedKey = crypto
        .createHash("sha256")
        .update(rawKey)
        .digest("hex");

    // Store prefix for display (first 12 characters)
    const prefix = rawKey.substring(0, 12);

    return {
        rawKey, // Return this to user ONCE
        hashedKey, // Store this in database
        prefix, // Store this for display (e.g., "mlp_1234...")
    };
}

/**
 * Hash an API key for comparison
 */
export function hashApiKey(rawKey: string): string {
    return crypto
        .createHash("sha256")
        .update(rawKey)
        .digest("hex");
}

/**
 * Verify an API key and return the associated user ID
 * This is what you'll use in your middleware
 */
export async function verifyApiKey(rawKey: string): Promise<{
    valid: boolean;
    userId?: string;
    keyId?: string;
}> {
    try {
        await connectToDatabase();

        // Hash the provided key
        const hashedKey = hashApiKey(rawKey);

        // Find the key in database
        const apiKey = await ApiKey.findOne({
            key: hashedKey,
            isActive: true,
        });

        if (!apiKey) {
            return { valid: false };
        }

        // Update last used timestamp (don't await to avoid blocking)
        ApiKey.findByIdAndUpdate(apiKey._id, {
            lastUsed: new Date(),
        }).catch(console.error);

        return {
            valid: true,
            userId: apiKey.userId.toString(),
            keyId: apiKey._id.toString(),
        };
    } catch (error) {
        console.error("API key verification error:", error);
        return { valid: false };
    }
}

/**
 * Check if API key exists (for middleware - simple version)
 * Returns boolean only for fast validation
 */
export async function isValidApiKey(rawKey: string): Promise<boolean> {
    const result = await verifyApiKey(rawKey);
    return result.valid;
}