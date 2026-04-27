"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type PaymentRecord = {
  _id: string
  provider: string
  flow: string
  phoneNumber: string
  amount: number
  currency: string
  status: string
  createdAt: string
}

export default function PaysuitPaymentsPage() {
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(false)

  const loadAccountData = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/paywall/me")
      if (!response.ok) {
        setWalletBalance(null)
        setPayments([])
        return
      }

      const data = await response.json()
      setWalletBalance(data.walletBalance ?? 0)
      setPayments(data.payments ?? [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container px-4 py-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paysuit Wallet & Payments</h1>
        <p className="text-muted-foreground mt-2">
          View your latest wallet balance and recent payment entries linked to your account.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
          <CardDescription>Click refresh to fetch the latest callback-synced balance.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <p className="text-2xl font-semibold">KES {walletBalance ?? "--"}</p>
            <Button variant="outline" size="sm" onClick={loadAccountData} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest payments associated with your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {payments.length === 0 && <p className="text-sm text-muted-foreground">No payments yet.</p>}
          {payments.map((payment) => (
            <div key={payment._id} className="border rounded-lg p-3 text-sm flex items-center justify-between">
              <div>
                <p className="font-medium">KES {payment.amount} · {payment.phoneNumber}</p>
                <p className="text-muted-foreground">{new Date(payment.createdAt).toLocaleString()}</p>
              </div>
              <p className="font-medium">{payment.status}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  )
}
