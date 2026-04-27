"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { History, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import React, { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { calculatePaywallFee } from "@/lib/paywall-fees"

type PaymentRecord = {
  _id: string
  flow: string
  phoneNumber: string
  amount: number
  fee: number
  status: string
  createdAt: string
}

type ApiKeyData = { _id: string; prefix: string }

export default function Wallet() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [amount, setAmount] = useState("10")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([])

  const fee = useMemo(() => calculatePaywallFee(Number(amount || 0)), [amount])

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

  const loadApiKeys = async () => {
    const response = await fetch("/api/user/apikeys")
    if (!response.ok) return
    const data = await response.json()
    setApiKeys(data.apiKeys || [])
  }

  useEffect(() => {
    const id = setTimeout(() => {
      void loadAccountData()
      void loadApiKeys()
    }, 0)

    return () => clearTimeout(id)
  }, [])

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
    <main className="container px-4 py-8 max-w-5xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="font-bold text-3xl mb-2">Direct Paywall Wallet</h1>
        <p className="text-muted-foreground">KES {walletBalance ?? "--"}</p>
        <p className="text-sm text-muted-foreground mt-1">Each direct transaction consumes fee bands from pricing. If fees are insufficient, recharge first.</p>
        <div className="flex items-center gap-3 mt-3">
          <Button variant="outline" size="sm" onClick={loadAccountData}>Refresh</Button>
        </div>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="recharge">Recharge Wallet</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />All Transactions</CardTitle>
              <CardDescription>Direct paywall records from your wallet-based account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {payments.length === 0 && <p className="text-sm text-muted-foreground">No transactions yet.</p>}
              {payments.map((payment) => (
                <div key={payment._id} className="border rounded-lg p-3 text-sm flex items-center justify-between">
                  <div>
                    <p className="font-medium">KES {payment.amount} · fee KES {payment.fee} · {payment.phoneNumber}</p>
                    <p className="text-muted-foreground">{new Date(payment.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="font-medium">{payment.status}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recharge" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recharge Wallet via STK Push</CardTitle>
              <CardDescription>Top up wallet to cover fees and direct transactions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="07XXXXXXXX or 2547XXXXXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (KES)</Label>
                <Input id="amount" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
                <p className="text-xs text-muted-foreground">Fee at this amount band: KES {fee}.</p>
              </div>

              <Button onClick={handleRecharge} disabled={loading}>{loading ? "Sending..." : "Recharge with STK Push"}</Button>
              {message && <p className="text-sm text-muted-foreground">{message}</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" />Developer Integration (Direct Paywall)</CardTitle>
          <CardDescription>Use your Paysuit API key to trigger direct STK and check wallet balance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiKeys.length === 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">No API key found. Generate one in My Account → Setup.</p>
              <Button onClick={() => (window.location.href = "/account")}>Generate API Key</Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Using API key prefix: <span className="font-mono">{apiKeys[0].prefix}...</span></p>
          )}

          <pre className="overflow-x-auto rounded-xl border bg-zinc-950 p-4 text-xs text-zinc-100"><code>{`POST /api/v1/direct/stk_push
Headers: X-API-Key: ${apiKeys[0]?.prefix ? `${apiKeys[0].prefix}...` : "<YOUR_API_KEY>"}
Body:
{
  "senderPhoneNumber": "254712345678",
  "amount": "100",
  "transactionDescription": "Order #902"
}`}</code></pre>

          <pre className="overflow-x-auto rounded-xl border bg-zinc-950 p-4 text-xs text-zinc-100"><code>{`GET /api/v1/direct/wallet
Headers: X-API-Key: ${apiKeys[0]?.prefix ? `${apiKeys[0].prefix}...` : "<YOUR_API_KEY>"}`}</code></pre>

          <pre className="overflow-x-auto rounded-xl border bg-zinc-950 p-4 text-xs text-zinc-100"><code>{`import { createMpesaClient } from "paysuitjs";

const client = createMpesaClient({
  baseUrl: "https://api.paysuit.co.ke",
  apiKey: process.env.PAYSUIT_API_KEY!,
  webhookUrl: "https://yourapp.com/api/payments/webhook"
});

await client.stkPush({ senderPhoneNumber: "254712345678", amount: "100" });`}</code></pre>
        </CardContent>
      </Card>
    </main>
  )
}
