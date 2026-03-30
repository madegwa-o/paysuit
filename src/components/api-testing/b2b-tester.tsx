"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle, Copy } from "lucide-react"

export default function B2BTester() {
    const [credentials, setCredentials] = useState({
        consumerKey: "",
        consumerSecret: "",
        initiatorName: "",
        initiatorPassword: "",
        shortCode: "",
    })

    const [testParams, setTestParams] = useState({
        commandId: "BusinessPayBill",
        receiverShortCode: "",
        amount: "",
        accountReference: "",
        remarks: "",
    })

    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setCredentials(prev => ({ ...prev, [name]: value }))
    }

    const handleParamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setTestParams(prev => ({ ...prev, [name]: value }))
    }

    const handleCommandChange = (value: string) => {
        setTestParams(prev => ({ ...prev, commandId: value }))
    }

    const handleTest = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setResponse(null)

        try {
            const res = await fetch("/api/daraja-test/b2b", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credentials, testParams }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Failed to test B2B")
            } else {
                setResponse(data)
            }
        } catch (err) {
            setError("An error occurred while testing the API")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>B2B - Business to Business</CardTitle>
                    <CardDescription>
                        Transfer funds between business accounts using Paybill or Buy Goods.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleTest} className="space-y-6">
                        {/* Credentials Section */}
                        <div className="border-b pb-6">
                            <h3 className="font-semibold mb-4">Daraja Credentials</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="consumerKey">Consumer Key</Label>
                                    <Input
                                        id="consumerKey"
                                        name="consumerKey"
                                        type="password"
                                        placeholder="Your consumer key"
                                        value={credentials.consumerKey}
                                        onChange={handleCredentialChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="consumerSecret">Consumer Secret</Label>
                                    <Input
                                        id="consumerSecret"
                                        name="consumerSecret"
                                        type="password"
                                        placeholder="Your consumer secret"
                                        value={credentials.consumerSecret}
                                        onChange={handleCredentialChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="initiatorName">Initiator Name</Label>
                                    <Input
                                        id="initiatorName"
                                        name="initiatorName"
                                        placeholder="Initiator username"
                                        value={credentials.initiatorName}
                                        onChange={handleCredentialChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="initiatorPassword">Initiator Password</Label>
                                    <Input
                                        id="initiatorPassword"
                                        name="initiatorPassword"
                                        type="password"
                                        placeholder="Initiator password"
                                        value={credentials.initiatorPassword}
                                        onChange={handleCredentialChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="shortCode">Short Code</Label>
                                    <Input
                                        id="shortCode"
                                        name="shortCode"
                                        placeholder="600003"
                                        value={credentials.shortCode}
                                        onChange={handleCredentialChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Test Parameters Section */}
                        <div>
                            <h3 className="font-semibold mb-4">Test Parameters</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="commandId">Command Type</Label>
                                    <Select value={testParams.commandId} onValueChange={handleCommandChange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BusinessPayBill">Business Pay Bill</SelectItem>
                                            <SelectItem value="BusinessBuyGoods">Business Buy Goods</SelectItem>
                                            <SelectItem value="DisburseFundsToBusiness">Disburse Funds</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="receiverShortCode">Receiver Short Code</Label>
                                    <Input
                                        id="receiverShortCode"
                                        name="receiverShortCode"
                                        placeholder="600000"
                                        value={testParams.receiverShortCode}
                                        onChange={handleParamChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount (KES)</Label>
                                    <Input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        placeholder="1000"
                                        value={testParams.amount}
                                        onChange={handleParamChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="accountReference">Account Reference</Label>
                                    <Input
                                        id="accountReference"
                                        name="accountReference"
                                        placeholder="ACC001"
                                        value={testParams.accountReference}
                                        onChange={handleParamChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="remarks">Remarks</Label>
                                    <Input
                                        id="remarks"
                                        name="remarks"
                                        placeholder="Test transfer"
                                        value={testParams.remarks}
                                        onChange={handleParamChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                "Test B2B"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Response Section */}
            {error && (
                <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {response && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            Response
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(response).map(([key, value]) => (
                                <div key={key} className="flex items-start justify-between p-3 bg-background rounded border">
                                    <div>
                                        <p className="text-sm font-medium">{key}</p>
                                        <p className="text-sm text-muted-foreground break-all">{String(value)}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(String(value))}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
