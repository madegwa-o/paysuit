"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

export default function PaysuitGatewayPage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [amount, setAmount] = useState("10")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [payments, setPayments] = useState<PaymentRecord[]>([])

  const loadAccountData = async () => {
    const response = await fetch("/api/paywall/me")
    if (!response.ok) {
      setWalletBalance(null)
      setPayments([])
      return
    }

    const data = await response.json()
    setWalletBalance(data.walletBalance ?? 0)
    setPayments(data.payments ?? [])
  }


  const handleRecharge = async () => {
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/paywall/paysuit/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, amount: Number(amount) }),
      })

      const data = await response.json()
      if (!response.ok) {
        setMessage(data.error || data.errorMessage || "Recharge request failed")
        return
      }

      setMessage(data.CustomerMessage || data.ResponseDescription || "STK push sent. Please approve on your phone.")
      void loadAccountData()
    } catch {
      setMessage("Unable to send recharge request.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container px-4 py-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paysuit Gateway (C2B)</h1>
        <p className="text-muted-foreground mt-2">
          This path requires wallet recharge first. Transactions are attached to the signed-in user account.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
          <CardDescription>Current balance linked to your user profile. Click refresh to sync latest callback results.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <p className="text-2xl font-semibold">KES {walletBalance ?? "--"}</p>
            <Button variant="outline" size="sm" onClick={loadAccountData}>Refresh</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recharge Account via STK Push</CardTitle>
          <CardDescription>Enter your number and amount, then approve the prompt on your phone.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="07XXXXXXXX or 2547XXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (KES)</Label>
            <Input id="amount" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <Button onClick={handleRecharge} disabled={loading}>
            {loading ? "Sending..." : "Recharge with STK Push"}
          </Button>

          {message && <p className="text-sm text-muted-foreground">{message}</p>}
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
