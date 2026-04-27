"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function MalipoGatewayPage() {
  const [c2bPhone, setC2bPhone] = useState("")
  const [c2bAmount, setC2bAmount] = useState("10")
  const [c2bLoading, setC2bLoading] = useState(false)
  const [c2bMessage, setC2bMessage] = useState("")

  const [b2cAmount, setB2cAmount] = useState("20")
  const [fee, setFee] = useState<number | null>(null)

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
    <main className="container px-4 py-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Malipo Gateway (C2B + B2C)</h1>
        <p className="text-muted-foreground mt-2">
          C2B is free to use. B2C includes a payout fee based on your amount tier. Requests are tied to the logged-in user.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Free C2B (STK Push)</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle>B2C Fee Calculator</CardTitle>
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
      </div>
    </main>
  )
}
