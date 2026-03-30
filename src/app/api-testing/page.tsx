"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import StkPushTester from "@/components/api-testing/stk-push-tester"
import B2CTester from "@/components/api-testing/b2c-tester"
import B2BTester from "@/components/api-testing/b2b-tester"
import AccountBalanceTester from "@/components/api-testing/account-balance-tester"
import TransactionStatusTester from "@/components/api-testing/transaction-status-tester"

export default function ApiTestingPage() {
    const [activeTab, setActiveTab] = useState("stk-push")

    return (
        <main className="container px-4 py-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="font-bold text-4xl mb-2">Daraja API Testing</h1>
                <p className="text-muted-foreground text-lg">
                    Test your M-Pesa Daraja API credentials before integrating into your application.
                </p>
            </div>

            <Alert className="mb-8 border-primary/50 bg-primary/5">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertDescription>
                    <strong>Sandbox Testing:</strong> Use your sandbox Consumer Key and Consumer Secret to test APIs safely. 
                    For production credentials, ensure you&apos;re using the correct environment.
                </AlertDescription>
            </Alert>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                    <TabsTrigger value="stk-push">STK Push</TabsTrigger>
                    <TabsTrigger value="b2c">B2C</TabsTrigger>
                    <TabsTrigger value="b2b">B2B</TabsTrigger>
                    <TabsTrigger value="account-balance">Account Balance</TabsTrigger>
                    <TabsTrigger value="transaction-status">Transaction Status</TabsTrigger>
                </TabsList>

                <TabsContent value="stk-push">
                    <StkPushTester />
                </TabsContent>

                <TabsContent value="b2c">
                    <B2CTester />
                </TabsContent>

                <TabsContent value="b2b">
                    <B2BTester />
                </TabsContent>

                <TabsContent value="account-balance">
                    <AccountBalanceTester />
                </TabsContent>

                <TabsContent value="transaction-status">
                    <TransactionStatusTester />
                </TabsContent>
            </Tabs>
        </main>
    )
}
