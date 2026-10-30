import mongoose, { type Types } from "mongoose"
import { User } from "@/models/User"
import { Payment } from "@/models/Payment"
import { ApiKey } from "@/models/ApiKey"
import { Subscription } from "@/models/Subscription" // adjust path

/** Wipes the user's data but keeps the account. */
export async function deleteUserData(userId: Types.ObjectId) {
    await Promise.all([
        Payment.deleteMany({ userId }),
        ApiKey.deleteMany({ userId }),
        Subscription.deleteMany({ userId }),
        // Raw collection call: partyB / accountReference exist in the Go model
        // but not in this Mongoose schema, so strict mode would ignore them.
        User.collection.updateOne(
            { _id: userId },
            {
                $set: { bankAccounts: [], updatedAt: new Date() },
                $unset: { address: "", partyB: "", accountReference: "" },
            },
        ),
    ])
}

/** Deletes everything, and the user document LAST so a failed run can be retried. */
export async function deleteUserAccount(userId: Types.ObjectId) {
    await deleteUserData(userId)
    // Written by the Go backend. Check the field name in NewMongoRefreshStore.
    await mongoose.connection
        .collection("refresh_tokens")
        .deleteMany({ $or: [{ userId }, { userId: userId.toString() }] })
    await User.deleteOne({ _id: userId })
}