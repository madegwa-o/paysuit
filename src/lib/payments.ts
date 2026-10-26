import { backendFetch } from "@/lib/backendFetch";

export type Provider = "MALIPO" | "PAYSUIT";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

export interface Payment {
    id: string;
    provider: Provider;
    phone: string;
    amount: number;
    accountReference: string;
    description: string;
    status: PaymentStatus;
    resultDesc?: string;
    mpesaReceipt?: string;
    createdAt: string;
}

export interface PaymentSettings {
    paymentProvider: Provider | "";
    partyB: string;
    accountReference: string;
}

export async function getSettings(): Promise<PaymentSettings> {
    const me = await backendFetch<Partial<PaymentSettings>>("/user/me");
    return {
        paymentProvider: me.paymentProvider ?? "",
        partyB: me.partyB ?? "",
        accountReference: me.accountReference ?? "",
    };
}

// The backend replaces all three settings, so resend the other two unchanged.
export async function setProvider(paymentProvider: Provider) {
    const current = await getSettings();
    await backendFetch("/user/payment-settings", {
        method: "PUT",
        body: { paymentProvider, partyB: current.partyB, accountReference: current.accountReference },
    });
}

export const listPayments = () => backendFetch<Payment[]>("/payments/");
export const getPayment = (id: string) => backendFetch<Payment>(`/payments/${id}`);
export const sendPrompt = (body: { phoneNumber: string; amount: number; description?: string }) =>
    backendFetch<Payment>("/payments/stk-push", { method: "POST", body });