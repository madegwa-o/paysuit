"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { History, KeyRound } from "lucide-react"
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

export default function ManagedPaywallPage() {
  const [c2bPhone, setC2bPhone] = useState("")
  const [c2bAmount, setC2bAmount] = useState("10")
  const [c2bLoading, setC2bLoading] = useState(false)
  const [c2bMessage, setC2bMessage] = useState("")
  const [accountBalance, setAccountBalance] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<PaymentRecord[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([])

  const [b2cAmount, setB2cAmount] = useState("20")
  const fee = useMemo(() => calculatePaywallFee(Number(b2cAmount || 0)), [b2cAmount])
  const totalDebit = useMemo(() => Number(b2cAmount || 0) + fee, [b2cAmount, fee])

  const loadData = async () => {
    const response = await fetch("/api/paywall/me")
    if (!response.ok) {
      setAccountBalance(null)
      setTransactions([])
      return
    }

    const data = await response.json()
    setAccountBalance(data.accountBalance ?? 0)
    setTransactions((data.payments || []).filter((p: PaymentRecord) => p.flow?.startsWith("MALIPO")))
  }

  const loadApiKeys = async () => {
    const response = await fetch("/api/user/apikeys")
    if (!response.ok) return
    const data = await response.json()
    setApiKeys(data.apiKeys || [])
  }

  useEffect(() => {
    const id = setTimeout(() => {
      void loadData()
      void loadApiKeys()
    }, 0)

    return () => clearTimeout(id)
  }, [])

  const handleC2B = async () => {
    setC2bLoading(true)
    setC2bMessage("")

    try {
      const response = await fetch("/api/paywall/malipo/stk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: c2bPhone, amount: Number(c2bAmount) }),
      })

      const data = await response.json()
      if (!response.ok) {
        setC2bMessage(data.error || data.errorMessage || "Managed STK request failed")
        return
      }

      setC2bMessage(data.CustomerMessage || data.ResponseDescription || "STK push sent. Please approve on your phone.")
      void loadData()
    } catch {
      setC2bMessage("Unable to initiate managed STK payment.")
    } finally {
      setC2bLoading(false)
    }
  }

  return (
    <main className="container px-4 py-8 max-w-5xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="font-bold text-3xl mb-2">Managed Paywall Account Balance</h1>
        <p className="text-muted-foreground">KES {accountBalance ?? "--"}</p>
        <p className="text-sm text-muted-foreground mt-1">Managed paywall uses Malipo credentials and account balance for collections/disbursements.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={loadData}>Refresh</Button>
      </div>

      <Tabs defaultValue="prompt" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="prompt">Collect (STK Push)</TabsTrigger>
          <TabsTrigger value="disburse">Disburse</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="prompt" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Collect Funds (STK Push)</CardTitle>
              <CardDescription>Collect customer payments into managed account balance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input placeholder="07XXXXXXXX or 2547XXXXXXXX" value={c2bPhone} onChange={(e) => setC2bPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Amount (KES)</Label>
                <Input type="number" min={1} value={c2bAmount} onChange={(e) => setC2bAmount(e.target.value)} />
              </div>
              <Button onClick={handleC2B} disabled={c2bLoading}>{c2bLoading ? "Sending..." : "Start Managed STK Push"}</Button>
              {c2bMessage && <p className="text-sm text-muted-foreground">{c2bMessage}</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disburse" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Disburse Funds</CardTitle>
              <CardDescription>Pricing page bands apply to each disbursement.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Disbursement Amount (KES)</Label>
                <Input type="number" min={1} value={b2cAmount} onChange={(e) => setB2cAmount(e.target.value)} />
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Amount: KES {Number(b2cAmount || 0)}</p>
                <p>Fee: KES {fee}</p>
                <p className="font-medium text-foreground">Total debit: KES {totalDebit}</p>
              </div>
              <p className="text-xs text-muted-foreground">Use this quote to ensure managed account balance can cover transaction + fee before sending disbursement API call.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Managed Transactions</CardTitle>
              <CardDescription>Incoming and outgoing managed paywall payments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {transactions.length === 0 && <p className="text-sm text-muted-foreground">No managed transactions yet.</p>}
              {transactions.map((payment) => (
                <div key={payment._id} className="border rounded-lg p-3 text-sm flex items-center justify-between">
                  <div>
                    <p className="font-medium">{payment.flow} · KES {payment.amount} · fee KES {payment.fee}</p>
                    <p className="text-muted-foreground">{payment.phoneNumber} · {new Date(payment.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="font-medium">{payment.status}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" />Developer Integration (Managed Paywall)</CardTitle>
          <CardDescription>Use your managed API key to collect, check balance and disburse.</CardDescription>
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

          <pre className="overflow-x-auto rounded-xl border bg-zinc-950 p-4 text-xs text-zinc-100"><code>{`POST /api/v1/managed/stk_push
Headers: X-API-Key: ${apiKeys[0]?.prefix ? `${apiKeys[0].prefix}...` : "<YOUR_API_KEY>"}
Body:
{
  "senderPhoneNumber": "254712345678",
  "amount": "500",
  "transactionDescription": "Wallet top up"
}`}</code></pre>

          <pre className="overflow-x-auto rounded-xl border bg-zinc-950 p-4 text-xs text-zinc-100"><code>{`GET /api/v1/managed/account_balance
Headers: X-API-Key: ${apiKeys[0]?.prefix ? `${apiKeys[0].prefix}...` : "<YOUR_API_KEY>"}`}</code></pre>

          <pre className="overflow-x-auto rounded-xl border bg-zinc-950 p-4 text-xs text-zinc-100"><code>{`POST /api/v1/managed/disburse
Headers: X-API-Key: ${apiKeys[0]?.prefix ? `${apiKeys[0].prefix}...` : "<YOUR_API_KEY>"}
Body:
{
  "phoneNumber": "254700000001",
  "amount": "300",
  "remarks": "Partner settlement"
}`}</code></pre>

          <pre className="overflow-x-auto rounded-xl border bg-zinc-950 p-4 text-xs text-zinc-100"><code>{`import { createMpesaClient } from "paysuitjs";

const client = createMpesaClient({
  baseUrl: "https://api.paysuit.co.ke",
  apiKey: process.env.PAYSUIT_API_KEY!,
  webhookUrl: "https://yourapp.com/api/payments/webhook"
});

await client.stkPush({ senderPhoneNumber: "254712345678", amount: "500" });`}</code></pre>
        </CardContent>
      </Card>
    </main>
  )
}
