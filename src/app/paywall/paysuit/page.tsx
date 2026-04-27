"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function PaysuitGatewayPage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [amount, setAmount] = useState("10")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

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
          This path requires wallet recharge first. Send an STK push to your number to top up.
        </p>
      </div>

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
    </main>
  )
}
