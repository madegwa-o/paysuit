import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function PaysuitGatewayPage() {
  return (
    <main className="container px-4 py-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paysuit Gateway</h1>
        <p className="text-muted-foreground mt-2">
          Paysuit now has separate pages for recharging your wallet and viewing wallet/payment history.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recharge Wallet</CardTitle>
            <CardDescription>Initiate an STK push to top up your Paysuit wallet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/paywall/paysuit/recharge">Open recharge page</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallet & Payments</CardTitle>
            <CardDescription>Check your current wallet balance and recent payment records.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/paywall/paysuit/payments">Open payments page</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
