"use server";

import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { User } from "@/models/User";
import { BankAccount, validateRecipient } from "@/lib/bankAccounts";

const MAX_ACCOUNTS = 10;
type Result = { ok: true; accounts: BankAccount[] } | { ok: false; error: string };

export async function getBankAccounts(): Promise<BankAccount[]> {
    const me = await getCurrentUser();
    if (!me) return [];
    await connectToDatabase();
    const doc = await User.findById(me.id)
        .select("bankAccounts")
        .lean<{ bankAccounts?: { _id: Types.ObjectId; paybill: string; accountNumber: string }[] }>();
    return (doc?.bankAccounts ?? []).map((a) => ({
        id: String(a._id),
        paybill: a.paybill,
        accountNumber: a.accountNumber,
    }));
}

export async function addBankAccount(input: { paybill: string; accountNumber: string }): Promise<Result> {
    const me = await getCurrentUser();
    if (!me) return { ok: false, error: "Please sign in to continue" };

    const paybill = String(input?.paybill ?? "").trim();
    const accountNumber = String(input?.accountNumber ?? "").trim();
    const invalid = validateRecipient({ paybill, accountNumber });
    if (invalid) return { ok: false, error: invalid };

    await connectToDatabase();
    const res = await User.updateOne(
        {
            _id: me.id,
            [`bankAccounts.${MAX_ACCOUNTS - 1}`]: { $exists: false }, // cap the list
            bankAccounts: { $not: { $elemMatch: { paybill, accountNumber } } }, // no duplicates
        },
        { $push: { bankAccounts: { paybill, accountNumber } } },
    );

    const accounts = await getBankAccounts();
    if (res.matchedCount === 0 && !accounts.some((a) => a.paybill === paybill && a.accountNumber === accountNumber)) {
        return { ok: false, error: `You can save up to ${MAX_ACCOUNTS} accounts` };
    }
    return { ok: true, accounts }; // already-saved duplicates count as success
}

export async function removeBankAccount(id: string): Promise<Result> {
    const me = await getCurrentUser();
    if (!me) return { ok: false, error: "Please sign in to continue" };
    if (!Types.ObjectId.isValid(id)) return { ok: false, error: "Invalid account" };

    await connectToDatabase();
    await User.updateOne({ _id: me.id }, { $pull: { bankAccounts: { _id: id } } });
    return { ok: true, accounts: await getBankAccounts() };
}