"use client"

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {History} from "lucide-react";
import {Button} from "@/components/ui/button";


import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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


export default function Wallet() {

    const [phoneNumber, setPhoneNumber] = useState("")
    const [amount, setAmount] = useState("10")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [walletBalance, setWalletBalance] = useState<number | null>(null)
    const [payments, setPayments] = useState<PaymentRecord[]>([])

    const transactions = [
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
    <main className="container px-4 py-8 max-w-5xl mx-auto">
        <div className="mb-8">
            <h1 className="font-bold text-3xl mb-2">Wallet Balance</h1>
            <p className="text-muted-foreground">sh {walletBalance ?? "--"}</p>
            <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={loadAccountData}>Refresh</Button>
            </div>
        </div>

        <Tabs defaultValue="sent" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="recharge">Recharge My Wallet</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            All Transactions
                        </CardTitle>
                        <CardDescription>All of your Transactions made from this api.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {transactions.map((tx) => (
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

            <TabsContent value="recharge" className="space-y-6">

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