import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Delete your Paysuit account" }

export default function DeleteAccountPage() {
    return (
        <main className="container max-w-2xl mx-auto px-4 py-12 space-y-6">
            <h1 className="text-3xl font-bold">Delete your Paysuit account</h1>
            <p className="text-muted-foreground">
                You can delete your Paysuit account and data at any time, in the app or on the web.
            </p>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold">How to delete</h2>
                <ol className="list-decimal pl-5 space-y-1">
                    <li>Sign in to your Paysuit account.</li>
                    <li>Open <strong>My Account → Settings → Danger Zone</strong>.</li>
                    <li>Choose <strong>Delete Account</strong> (everything) or <strong>Delete My Data</strong> (keeps the account), then confirm.</li>
                </ol>
                <Button asChild><Link href="/signin?callbackUrl=/account">Sign in to continue</Link></Button>
                <p className="text-sm text-muted-foreground">
                    Can't sign in? Email support@paysuit.co.ke from your registered address and we'll process the request.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold">What gets deleted</h2>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Profile, phone numbers and saved bank accounts</li>
                    <li>Transaction history, API keys and push notification subscriptions</li>
                    <li>Login sessions and refresh tokens</li>
                </ul>
                <h2 className="text-xl font-semibold pt-2">What we may keep</h2>
                <p>Edit this to match your policy, for example records you must keep for legal or M-Pesa reconciliation reasons and for how long.</p>
            </section>
        </main>
    )
}