import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type FeeRow = {
  from: string
  to: string
  fee: string
}

const feeSchedule: FeeRow[] = [
  { from: "KES 1", to: "KES 49", fee: "KES 1" },
  { from: "KES 50", to: "KES 499", fee: "KES 6" },
  { from: "KES 500", to: "KES 999", fee: "KES 10" },
  { from: "KES 1,000", to: "KES 1,499", fee: "KES 15" },
  { from: "KES 1,500", to: "KES 2,499", fee: "KES 20" },
  { from: "KES 2,500", to: "KES 3,499", fee: "KES 25" },
  { from: "KES 3,500", to: "KES 4,999", fee: "KES 30" },
  { from: "KES 5,000", to: "KES 7,499", fee: "KES 40" },
  { from: "KES 7,500", to: "KES 9,999", fee: "KES 45" },
  { from: "KES 10,000", to: "KES 14,999", fee: "KES 50" },
  { from: "KES 15,000", to: "KES 19,999", fee: "KES 55" },
  { from: "KES 20,000", to: "KES 34,999", fee: "KES 80" },
  { from: "KES 35,000", to: "KES 34,999", fee: "KES 80" },
  { from: "KES 35,000", to: "KES 49,999", fee: "KES 105" },
  { from: "KES 50,000", to: "KES 149,999", fee: "KES 130" },
  { from: "KES 150,000", to: "KES 249,999", fee: "KES 160" },
  { from: "KES 250,000", to: "KES 349,999", fee: "KES 195" },
  { from: "KES 350,000", to: "KES 549,999", fee: "KES 230" },
  { from: "KES 550,000", to: "KES 749,999", fee: "KES 275" },
  { from: "KES 750,000", to: "KES 999,999", fee: "KES 320" },
]

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
                {feeSchedule.map((row) => (
                  <tr key={`${row.from}-${row.to}-${row.fee}`} className="border-b">
                    <td className="py-2 pr-4">{row.from}</td>
                    <td className="py-2 pr-4">{row.to}</td>
                    <td className="py-2">{row.fee}</td>
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
