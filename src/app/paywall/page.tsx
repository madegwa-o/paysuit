import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function PaywallPage() {
  return (
    <main className="container px-4 py-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paywall Gateway Options</h1>
        <p className="text-muted-foreground mt-2">
          Choose between Paysuit credentials (wallet top-up required) and Malipo credentials (free C2B, paid B2C disbursements).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Paysuit C2B</CardTitle>
            <CardDescription>Use Paysuit API credentials for customer-to-business collections.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/paywall/paysuit">Open Paysuit page</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Malipo C2B/B2C</CardTitle>
            <CardDescription>Use Malipo credentials for free C2B and charged B2C transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/paywall/malipo">Open Malipo page</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
