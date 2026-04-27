"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {History} from "lucide-react";

export default function MalipoGatewayPage() {
  const [c2bPhone, setC2bPhone] = useState("")
  const [c2bAmount, setC2bAmount] = useState("10")
  const [c2bLoading, setC2bLoading] = useState(false)
  const [c2bMessage, setC2bMessage] = useState("")

  const [b2cAmount, setB2cAmount] = useState("20")
  const [fee, setFee] = useState<number | null>(null)

  const [transactions, setTransactions] = useState([]);

  // --- Mock M-Pesa style "sent" transactions ---
  const sentTransactions = [
    {
      id: 1,
      date: "2025-11-02",
      recipient: "John Mwangi",
      amount: "KES 500.00",
      reference: "MP231AX90K",
      note: "Subscription payment",
    },
    {
      id: 2,
      date: "2025-10-31",
      recipient: "Paybill 247247 - Safaricom",
      amount: "KES 1,200.00",
      reference: "MP22GDH4LM",
      note: "Data bundle purchase",
    },
    {
      id: 3,
      date: "2025-10-28",
      recipient: "Till 654321 - Java House",
      amount: "KES 850.00",
      reference: "MP21FR7BCJ",
      note: "Coffee & lunch payment",
    },
  ];

  // --- Mock M-Pesa style "received" transactions ---
  const receivedTransactions = [
    {
      id: 1,
      date: "2025-10-30",
      sender: "Peter Otieno",
      amount: "KES 2,000.00",
      reference: "MP22GDH4RT",
      note: "Refund for goods",
    },
    {
      id: 2,
      date: "2025-10-26",
      sender: "Till 783922 - QuickPay Ltd",
      amount: "KES 3,500.00",
      reference: "MP21KX6PLT",
      note: "Disbursement payout",
    },
    {
      id: 3,
      date: "2025-10-25",
      sender: "Wallet Transfer",
      amount: "KES 1,000.00",
      reference: "MP21AJ5CCP",
      note: "Balance top-up",
    },
  ];

  const totalDebit = useMemo(() => {
    const amount = Number(b2cAmount)
    if (!Number.isFinite(amount) || fee === null) return null
    return amount + fee
  }, [b2cAmount, fee])

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
        setC2bMessage(data.error || data.errorMessage || "C2B request failed")
        return
      }

      setC2bMessage(data.CustomerMessage || data.ResponseDescription || "STK push sent. Please approve on your phone.")
    } catch {
      setC2bMessage("Unable to initiate Malipo C2B payment.")
    } finally {
      setC2bLoading(false)
    }
  }

  const handleB2CQuote = async () => {
    const response = await fetch("/api/paywall/malipo/b2c/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(b2cAmount) }),
    })

    const data = await response.json()
    setFee(response.ok ? data.fee : null)
  }

  return (
      <main className="container px-4 py-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-bold text-3xl mb-2">Account Balance </h1>
          <p className="text-muted-foreground">sh 300</p>
        </div>

        <Tabs defaultValue="sent" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="prompt">Send Prompt(stk push)</TabsTrigger>
            <TabsTrigger value="disburse">Disburse</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="prompt" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Send Prompt (STK Push)</CardTitle>
                <CardDescription>Collect customer payments with Malipo credentials.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                      placeholder="07XXXXXXXX or 2547XXXXXXXX"
                      value={c2bPhone}
                      onChange={(e) => setC2bPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount (KES)</Label>
                  <Input type="number" min={1} value={c2bAmount} onChange={(e) => setC2bAmount(e.target.value)} />
                </div>
                <Button onClick={handleC2B} disabled={c2bLoading}>{c2bLoading ? "Sending..." : "Start C2B STK Push"}</Button>
                {c2bMessage && <p className="text-sm text-muted-foreground">{c2bMessage}</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disburse" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Disburse Funds</CardTitle>
                <CardDescription>Tariff: 0-20 free, 21-50 is 5 KES, then +5 KES per extra 50 KES band.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>B2C Amount (KES)</Label>
                  <Input type="number" min={1} value={b2cAmount} onChange={(e) => setB2cAmount(e.target.value)} />
                </div>
                <Button variant="outline" onClick={handleB2CQuote}>Calculate B2C Fee</Button>
                {fee !== null && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Amount: KES {Number(b2cAmount)}</p>
                      <p>Fee: KES {fee}</p>
                      <p className="font-medium text-foreground">Total debit: KES {totalDebit}</p>
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="transactions" className="space-y-6">
            <main className="container px-4 py-8 max-w-5xl mx-auto">
              <div className="mb-8">
                <h1 className="font-bold text-3xl mb-2">Transactions</h1>
                <p className="text-muted-foreground">Track your M-Pesa paywall activity and balances.</p>
              </div>

              <Tabs defaultValue="sent" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                  <TabsTrigger value="sent">Sent</TabsTrigger>
                  <TabsTrigger value="received">Received</TabsTrigger>
                </TabsList>

                {/* --- Sent Transactions --- */}
                <TabsContent value="sent" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Sent Payments
                      </CardTitle>
                      <CardDescription>All outgoing M-Pesa payments made from your wallet.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {sentTransactions.map((tx) => (
                            <div
                                key={tx.id}
                                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold">{tx.recipient}</h3>
                                <span className="text-muted-foreground text-xs">{tx.date}</span>
                              </div>
                              <p className="text-sm font-medium text-primary mb-1">{tx.amount}</p>
                              <p className="text-muted-foreground text-sm mb-2">
                                Ref: {tx.reference} — {tx.note}
                              </p>
                              <Button variant="outline" size="sm" className="bg-transparent">
                                View Details
                              </Button>
                            </div>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full mt-4 bg-transparent">
                        Load More
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* --- Received Transactions --- */}
                <TabsContent value="received" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Received Funds
                      </CardTitle>
                      <CardDescription>All incoming payments to your wallet.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {receivedTransactions.map((tx) => (
                            <div
                                key={tx.id}
                                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold">{tx.sender}</h3>
                                <span className="text-muted-foreground text-xs">{tx.date}</span>
                              </div>
                              <p className="text-sm font-medium text-green-600 mb-1">{tx.amount}</p>
                              <p className="text-muted-foreground text-sm mb-2">
                                Ref: {tx.reference} — {tx.note}
                              </p>
                              <Button variant="outline" size="sm" className="bg-transparent">
                                View Details
                              </Button>
                            </div>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full mt-4 bg-transparent">
                        Load More
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </main>
          </TabsContent>
        </Tabs>
        <tr></tr>
        <section>
          <h1>Or intergrate this into your app using our library or send a request to our Apis</h1>
          {/*add intergration instructions for devs*/}
        </section>
      </main>


  )
}
