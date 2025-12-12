// models/ApiKey.ts
import { Schema, model, models, Document, Types } from "mongoose";
import crypto from "crypto";

export interface IApiKey extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    label: string;
    key: string; // The actual API key (hashed)
    prefix: string; // First 8 chars for display (e.g., "mlp_1234...")
    lastUsed?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ApiKeySchema = new Schema<IApiKey>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        label: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        key: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        prefix: {
            type: String,
            required: true,
        },
        lastUsed: {
            type: Date,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Compound index for efficient queries
ApiKeySchema.index({ userId: 1, isActive: 1 });
ApiKeySchema.index({ key: 1, isActive: 1 });

export const ApiKey = models.ApiKey || model<IApiKey>("ApiKey", ApiKeySchema);