
export interface BankAccount { id: string; paybill: string; accountNumber: string }
export interface Recipient { paybill: string; accountNumber: string }

export function validateRecipient(r: Recipient): string | null {
    if (!/^\d{5,7}$/.test(r.paybill)) return "Paybill must be 5 to 7 digits";
    if (!/^[\w .-]{1,13}$/.test(r.accountNumber)) return "Account number must be 1 to 13 characters";
    return null;
}