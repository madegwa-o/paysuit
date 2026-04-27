import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { PAYWALL_FEE_BANDS } from "@/lib/paywall-fees"

export default function PricingPage() {
  return (
    <main className="container px-4 py-10 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pricing</h1>
        <p className="text-muted-foreground mt-2">Pricing</p>
        <p className="text-muted-foreground">Transaction fees by amount range.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee schedule</CardTitle>
          <CardDescription>Amount-based transaction fee bands.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Amount from</th>
                  <th className="py-2 pr-4">Amount to</th>
                  <th className="py-2">Transaction fee</th>
                </tr>
              </thead>
              <tbody>
                {PAYWALL_FEE_BANDS.map((row) => (
                  <tr key={`${row.min}-${row.max}-${row.fee}`} className="border-b">
                    <td className="py-2 pr-4">KES {row.min.toLocaleString()}</td>
                    <td className="py-2 pr-4">KES {row.max.toLocaleString()}</td>
                    <td className="py-2">KES {row.fee.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
