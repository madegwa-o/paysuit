"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TransactionsPage() {
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

    return (
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
    );
}
