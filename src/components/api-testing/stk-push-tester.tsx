"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, CheckCircle2, XCircle, Copy, Save, Trash2 } from "lucide-react"
import { useSavedCredentials } from "@/hooks/use-saved-credentials"

export default function StkPushTester() {
    const { credentials: savedCredentials, saveCredential, getCredential, deleteCredential } = useSavedCredentials()
    
    const [credentials, setCredentials] = useState({
        consumerKey: "",
        consumerSecret: "",
        shortCode: "",
        passkey: "",
    })
    
    const [selectedCredentialId, setSelectedCredentialId] = useState<string>("")
    const [saveCredentialName, setSaveCredentialName] = useState("")
    const [showSaveForm, setShowSaveForm] = useState(false)

    const [testParams, setTestParams] = useState({
        phoneNumber: "",
        amount: "",
        accountReference: "",
        transactionDescription: "",
    })

    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setCredentials(prev => ({ ...prev, [name]: value }))
    }

    const handleParamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setTestParams(prev => ({ ...prev, [name]: value }))
    }

    const handleLoadCredential = (credentialId: string) => {
        const saved = getCredential(credentialId)
        if (saved) {
            setCredentials({
                consumerKey: saved.consumerKey,
                consumerSecret: saved.consumerSecret,
                shortCode: saved.shortCode || "",
                passkey: saved.passkey || "",
            })
            setSelectedCredentialId(credentialId)
        }
    }

    const handleSaveCredential = () => {
        if (!saveCredentialName.trim()) {
            alert("Please enter a name for this credential")
            return
        }

        saveCredential({
            name: saveCredentialName,
            consumerKey: credentials.consumerKey,
            consumerSecret: credentials.consumerSecret,
            shortCode: credentials.shortCode,
            passkey: credentials.passkey,
        })

        setSaveCredentialName("")
        setShowSaveForm(false)
        alert("Credential saved successfully!")
    }

    const handleDeleteCredential = (credentialId: string) => {
        if (window.confirm("Are you sure you want to delete this credential?")) {
            deleteCredential(credentialId)
            if (selectedCredentialId === credentialId) {
                setSelectedCredentialId("")
                setCredentials({ consumerKey: "", consumerSecret: "", shortCode: "", passkey: "" })
            }
        }
    }

    const handleTest = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setResponse(null)

        try {
            const res = await fetch("/api/daraja-test/stk-push", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credentials, testParams }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Failed to test STK Push")
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
                    <CardTitle>STK Push (C2B)</CardTitle>
                    <CardDescription>
                        Initiate a payment prompt on customer&apos;s M-Pesa phone.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleTest} className="space-y-6">
                        {/* Saved Credentials */}
                        {savedCredentials.length > 0 && (
                            <div className="border-b pb-6">
                                <h3 className="font-semibold mb-4">Load Saved Credentials</h3>
                                <div className="space-y-3">
                                    <Select value={selectedCredentialId} onValueChange={handleLoadCredential}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a saved credential..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {savedCredentials.map(cred => (
                                                <SelectItem key={cred.id} value={cred.id}>
                                                    {cred.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedCredentialId && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => handleDeleteCredential(selectedCredentialId)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Selected
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

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
                                    <Label htmlFor="shortCode">Short Code</Label>
                                    <Input
                                        id="shortCode"
                                        name="shortCode"
                                        placeholder="174379"
                                        value={credentials.shortCode}
                                        onChange={handleCredentialChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="passkey">Pass Key</Label>
                                    <Input
                                        id="passkey"
                                        name="passkey"
                                        type="password"
                                        placeholder="Your M-Pesa pass key"
                                        value={credentials.passkey}
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
                                    <Label htmlFor="phoneNumber">Phone Number</Label>
                                    <Input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        placeholder="254700000000"
                                        value={testParams.phoneNumber}
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
                                        placeholder="100"
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
                                        placeholder="Test Payment"
                                        value={testParams.accountReference}
                                        onChange={handleParamChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="transactionDescription">Transaction Description</Label>
                                    <Input
                                        id="transactionDescription"
                                        name="transactionDescription"
                                        placeholder="Testing STK Push"
                                        value={testParams.transactionDescription}
                                        onChange={handleParamChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button type="submit" disabled={loading} className="flex-1">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Testing...
                                    </>
                                ) : (
                                    "Test STK Push"
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowSaveForm(!showSaveForm)}
                            >
                                <Save className="h-4 w-4" />
                            </Button>
                        </div>

                        {showSaveForm && (
                            <div className="border-t pt-6 space-y-3">
                                <Label htmlFor="credentialName">Save as...</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="credentialName"
                                        placeholder="e.g., Production Account"
                                        value={saveCredentialName}
                                        onChange={(e) => setSaveCredentialName(e.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleSaveCredential}
                                    >
                                        Save
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Credentials are saved locally in your browser. They are not sent to any server.
                                </p>
                            </div>
                        )}
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
