import {Schema, Types} from "mongoose";

export interface IBankAccount {
    _id?: Types.ObjectId;
    paybill: string;
    accountNumber: string;
}

export const BankAccountSchema = new Schema<IBankAccount>({
    paybill: { type: String, required: true, trim: true, match: [/^\d{5,7}$/, "Invalid paybill"] },
    accountNumber: { type: String, required: true, trim: true, maxlength: 12 },
});

