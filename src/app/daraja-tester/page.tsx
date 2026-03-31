  "use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type {
  DarajaAuthResponse,
  DarajaAuthSuccessResponse,
  DarajaErrorResponse,
  DarajaStkPushRequest,
} from "@/types/daraja"
import {
  Key, RefreshCw, Shield, ChevronDown, ChevronUp,
  Loader2, CheckCircle2, XCircle, AlertCircle, Send, Terminal,
  Zap, Activity, CreditCard, ArrowLeftRight, BarChart3, QrCode,
  FileText, Repeat, Wallet, Users, Copy, Check
} from "lucide-react"

type Environment = "sandbox" | "production"
type StepStatus = "idle" | "loading" | "success" | "error"

interface AuthToken {
  access_token: string
  expires_in: number
  generated_at: number
}

interface ApiResult {
  status: StepStatus
  response: Record<string, unknown> | null
  error: string
  timestamp: string
  httpStatus?: number
}

const BASE = {
  sandbox: "https://sandbox.safaricom.co.ke",
  production: "https://api.safaricom.co.ke",
}
const STK_TRANSACTION_TYPES: DarajaStkPushRequest["TransactionType"][] = ["CustomerPayBillOnline", "CustomerBuyGoodsOnline"]

// ─── Shared helpers ──────────────────────────────────────────────────────────

function getTimestamp() {
  return new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14)
}
function getPassword(shortCode: string, passkey: string, ts: string) {
  return btoa(`${shortCode}${passkey}${ts}`)
}
function getAutoSecurityCredential(initiator: string, secret: string) {
  return btoa(`${initiator}:${secret}:${getTimestamp()}`)
}
function getApiErrorMessage(data: unknown) {
  const payload = (data && typeof data === "object") ? data as Record<string, unknown> : {}
  return String(
    payload.errorMessage
      || payload.error_description
      || payload.ResponseDescription
      || payload.ResultDesc
      || payload.error
      || "Request failed.",
  )
}

// ─── Section wrapper ───────────────────────────────────────────────────

function Section({
  icon: Icon, title, endpoint, children, result, defaultOpen = false
}: {
  icon: React.ElementType
  title: string
  endpoint: string
  children: React.ReactNode
  result: ApiResult | null
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [copied, setCopied] = useState(false)
  const hasResponse = result?.response !== null && result?.response !== undefined

  const copyResult = () => {
    if (!result?.response) return
    navigator.clipboard.writeText(JSON.stringify(result.response, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Card className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/20 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs text-muted-foreground font-mono truncate max-w-xs">{endpoint}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {result?.status === "loading" && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          {result?.status === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {result?.status === "error" && <XCircle className="w-4 h-4 text-red-500" />}
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border/50 px-5 pb-5 pt-4 space-y-4">
          {children}

          {result?.error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700 dark:text-red-400">{result.error}</p>
            </div>
          )}

          {hasResponse && result && (
            <div className={`rounded-xl border p-4 ${
              result.status === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Response</span>
                  {result.timestamp && <span className="text-xs text-muted-foreground">· {result.timestamp}</span>}
                  {!!result.httpStatus && <span className="text-xs text-muted-foreground">· HTTP {result.httpStatus}</span>}
                </div>
                <button onClick={copyResult} className="text-muted-foreground hover:text-foreground transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <pre className={`text-xs font-mono overflow-auto max-h-56 whitespace-pre-wrap break-all ${
                result.status === "success"
                  ? "text-emerald-800 dark:text-emerald-300"
                  : "text-red-800 dark:text-red-300"
              }`}>
                {JSON.stringify(result.response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

// ─── Field helpers ────────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, type = "text", hint, readOnly = false }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; hint?: string; readOnly?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
      <Input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className="bg-muted/30 border-border/70 rounded-xl font-mono text-sm h-9"
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}

function ActionButton({ onClick, loading, label, disabled }: {
  onClick: () => void; loading: boolean; label: string; disabled?: boolean
}) {
  return (
    <Button
      onClick={onClick}
      disabled={loading || disabled}
      className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl h-9 text-sm font-semibold"
    >
      {loading
        ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Sending...</>
        : <><Send className="w-3.5 h-3.5 mr-2" />{label}</>}
    </Button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Page() {
  const [env, setEnv] = useState<Environment>("sandbox")
  const [consumerKey, setConsumerKey] = useState("")
  const [consumerSecret, setConsumerSecret] = useState("")
  const [passkey, setPasskey] = useState("")
  const [initiatorName, setInitiatorName] = useState("")
  const [shortCode, setShortCode] = useState("174379")

  const [authToken, setAuthToken] = useState<AuthToken | null>(null)
  const [tokenStatus, setTokenStatus] = useState<StepStatus>("idle")
  const [tokenError, setTokenError] = useState("")

  // Per-API results
  const [results, setResults] = useState<Record<string, ApiResult>>({})

  const base = BASE[env]

  const isTokenValid = useCallback(() => {
    if (!authToken) return false
    return (Date.now() - authToken.generated_at) / 1000 < authToken.expires_in - 60
  }, [authToken])

  const tokenRemaining = useCallback(() => {
    if (!authToken) return null
    const r = authToken.expires_in - Math.floor((Date.now() - authToken.generated_at) / 1000)
    if (r <= 0) return "Expired"
    return `${Math.floor(r / 60)}m ${r % 60}s`
  }, [authToken])

  const setResult = (key: string, r: Partial<ApiResult>) =>
    setResults(prev => {
      const existing = prev[key] ?? { status: "idle", response: null, error: "", timestamp: "" }
      return { ...prev, [key]: { ...existing, ...r } }
    })

  const timestamp = () => new Date().toLocaleTimeString()

  // ── Auth ──────────────────────────────────────────────────────────────────

  const generateToken = async () => {
    if (!consumerKey || !consumerSecret) { setTokenError("Consumer Key and Secret required."); return }
    setTokenStatus("loading"); setTokenError(""); setAuthToken(null)
    try {

      console.log("Auth frontend calling")
      const creds = btoa(`${consumerKey}:${consumerSecret}`)
      const res = await fetch(`/api/mpesa/auth?env=${env}&credentials=${encodeURIComponent(creds)}`)
      const data = (await res.json()) as DarajaAuthResponse
      const successData = data as DarajaAuthSuccessResponse
      const expiresIn = Number(successData.expires_in)
      if (typeof successData.access_token === "string" && Number.isFinite(expiresIn) && expiresIn > 0) {
        setAuthToken({ access_token: successData.access_token, expires_in: expiresIn, generated_at: Date.now() })
        setTokenStatus("success")
      } else {
        setTokenError(getApiErrorMessage(data))
        setTokenStatus("error")
      }
    } catch { setTokenError("Network error. Ensure API route /api/mpesa/auth exists."); setTokenStatus("error") }
  }

  // ── Generic POST/GET caller ───────────────────────────────────────────────

  const call = async (key: string, url: string, body: unknown, method = "POST") => {
    if (!isTokenValid()) { setResult(key, { status: "error", error: "No valid token. Generate one first.", timestamp: timestamp() }); return }
    setResult(key, { status: "loading", response: null, error: "" })
    try {
      const opts: RequestInit = {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken!.access_token}` },
        ...(method !== "GET" && { body: JSON.stringify(body) }),
      }
      const res = await fetch(`/api/mpesa/proxy?url=${encodeURIComponent(url)}`, opts)
      const data = (await res.json()) as DarajaErrorResponse
      const responseCode = String(data.ResponseCode ?? "")
      const resultCode = String(data.ResultCode ?? "")
      const success = responseCode === "0" || resultCode === "0" || (res.ok && !data.errorCode)
      setResult(key, {
        status: success ? "success" : "error",
        response: data as Record<string, unknown>,
        error: success ? "" : getApiErrorMessage(data),
        timestamp: timestamp(),
        httpStatus: res.status,
      })
    } catch (e) {
      setResult(key, { status: "error", error: String(e), timestamp: timestamp() })
    }
  }

  // ─── Per-API state fields ──────────────────────────────────────────────────

  // STK Push
  const [stkPhone, setStkPhone] = useState("254722000000")
  const [stkAmount, setStkAmount] = useState("1")
  const [stkCallback, setStkCallback] = useState("https://mydomain.com/callback")
  const [stkRef, setStkRef] = useState("PaysuiteRef")
  const [stkDesc, setStkDesc] = useState("Payment")
  const [stkType, setStkType] = useState<DarajaStkPushRequest["TransactionType"]>("CustomerPayBillOnline")
  const [stkPartyB, setStkPartyB] = useState("174379")

  // STK Query
  const [stkQueryCheckout, setStkQueryCheckout] = useState("")

  // C2B Register
  const [c2bConfirmUrl, setC2bConfirmUrl] = useState("https://mydomain.com/confirm")
  const [c2bValidationUrl, setC2bValidationUrl] = useState("https://mydomain.com/validate")
  const [c2bResponseType, setC2bResponseType] = useState("Completed")
  const [c2bShortCode, setC2bShortCode] = useState("600000")

  // B2C
  const [b2cPhone, setB2cPhone] = useState("254722000000")
  const [b2cAmount, setB2cAmount] = useState("10")
  const [b2cCommand, setB2cCommand] = useState("BusinessPayment")
  const [b2cRemarks, setB2cRemarks] = useState("Salary")
  const [b2cOccasion, setB2cOccasion] = useState("")
  const [b2cResultUrl, setB2cResultUrl] = useState("https://mydomain.com/b2c/result")
  const [b2cTimeoutUrl, setB2cTimeoutUrl] = useState("https://mydomain.com/b2c/timeout")
  const [b2cShortCode, setB2cShortCode] = useState("600000")

  // B2B
  const [b2bAmount, setB2bAmount] = useState("100")
  const [b2bPartyA, setB2bPartyA] = useState("600000")
  const [b2bPartyB, setB2bPartyB] = useState("600001")
  const [b2bCommand, setB2bCommand] = useState("BusinessPayBill")
  const [b2bRemarks, setB2bRemarks] = useState("B2B Payment")
  const [b2bAccountRef, setB2bAccountRef] = useState("Account001")
  const [b2bResultUrl, setB2bResultUrl] = useState("https://mydomain.com/b2b/result")
  const [b2bTimeoutUrl, setB2bTimeoutUrl] = useState("https://mydomain.com/b2b/timeout")

  // Account Balance
  const [balShortCode, setBalShortCode] = useState("600000")
  const [balIdType, setBalIdType] = useState("4")
  const [balResultUrl, setBalResultUrl] = useState("https://mydomain.com/balance/result")
  const [balTimeoutUrl, setBalTimeoutUrl] = useState("https://mydomain.com/balance/timeout")

  // Transaction Status
  const [tsTransId, setTsTransId] = useState("")
  const [tsShortCode, setTsShortCode] = useState("600000")
  const [tsIdType, setTsIdType] = useState("1")
  const [tsResultUrl, setTsResultUrl] = useState("https://mydomain.com/status/result")
  const [tsTimeoutUrl, setTsTimeoutUrl] = useState("https://mydomain.com/status/timeout")

  // Reversal
  const [revTransId, setRevTransId] = useState("")
  const [revShortCode, setRevShortCode] = useState("600000")
  const [revAmount, setRevAmount] = useState("10")
  const [revResultUrl, setRevResultUrl] = useState("https://mydomain.com/reversal/result")
  const [revTimeoutUrl, setRevTimeoutUrl] = useState("https://mydomain.com/reversal/timeout")
  const [revRemarks, setRevRemarks] = useState("Reversal")

  // QR Code
  const [qrMerchantName, setQrMerchantName] = useState("Paysuit Ltd")
  const [qrRefNo, setQrRefNo] = useState("QR001")
  const [qrAmount, setQrAmount] = useState("100")
  const [qrTrxCode, setQrTrxCode] = useState("BG")
  const [qrCPI, setQrCPI] = useState("174379")
  const [qrSize, setQrSize] = useState("300")

  // Bill Manager Opt-In
  const [bmEmail, setBmEmail] = useState("")
  const [bmOfficialContact, setBmOfficialContact] = useState("")
  const [bmShortCode, setBmShortCode] = useState("")
  const [bmLogo, setBmLogo] = useState("")
  const [bmCallbackUrl, setBmCallbackUrl] = useState("https://mydomain.com/bm/callback")

  // Bill Manager Single Invoice
  const [bmExtRef, setBmExtRef] = useState("INV001")
  const [bmBilledTo, setBmBilledTo] = useState("")
  const [bmPhone, setBmPhone] = useState("254722000000")
  const [bmBillDesc, setBmBillDesc] = useState("Invoice for services")
  const [bmDueDate, setBmDueDate] = useState("2025-12-31")
  const [bmInvAmount, setBmInvAmount] = useState("1000")
  const [bmAccount, setBmAccount] = useState("ACC001")

  // ── API callers ───────────────────────────────────────────────────────────

  const sendSTK = () => {
    const ts = getTimestamp()
    const payload: DarajaStkPushRequest = {
      BusinessShortCode: parseInt(shortCode),
      Password: getPassword(shortCode, passkey, ts),
      Timestamp: ts, TransactionType: stkType,
      Amount: stkAmount, PartyA: stkPhone,
      PartyB: stkPartyB, PhoneNumber: stkPhone,
      CallBackURL: stkCallback,
      AccountReference: stkRef.slice(0, 12),
      TransactionDesc: stkDesc.slice(0, 13),
    }
    call("stk", `${base}/mpesa/stkpush/v1/processrequest`, payload)
  }

  const sendSTKQuery = () => {
    const ts = getTimestamp()
    call("stkquery", `${base}/mpesa/stkpushquery/v1/query`, {
      BusinessShortCode: parseInt(shortCode),
      Password: getPassword(shortCode, passkey, ts),
      Timestamp: ts,
      CheckoutRequestID: stkQueryCheckout,
    })
  }

  const registerC2B = (v: "v1" | "v2") => {
    call(`c2b_${v}`, `${base}/mpesa/c2b/${v}/registerurl`, {
      ShortCode: c2bShortCode,
      ResponseType: c2bResponseType,
      ConfirmationURL: c2bConfirmUrl,
      ValidationURL: c2bValidationUrl,
    })
  }

  const sendB2C = () => {
    const generatedSecurityCredential = getAutoSecurityCredential(initiatorName, consumerSecret)
    call("b2c", `${base}/mpesa/b2c/v1/paymentrequest`, {
      InitiatorName: initiatorName,
      SecurityCredential: generatedSecurityCredential,
      CommandID: b2cCommand,
      Amount: b2cAmount,
      PartyA: b2cShortCode,
      PartyB: b2cPhone,
      Remarks: b2cRemarks,
      QueueTimeOutURL: b2cTimeoutUrl,
      ResultURL: b2cResultUrl,
      Occasion: b2cOccasion,
    })
  }

  const sendB2B = () => {
    const generatedSecurityCredential = getAutoSecurityCredential(initiatorName, consumerSecret)
    call("b2b", `${base}/mpesa/b2b/v1/paymentrequest`, {
      Initiator: initiatorName,
      SecurityCredential: generatedSecurityCredential,
      CommandID: b2bCommand,
      SenderIdentifierType: "4",
      ReceiverIdentifierType: "4",
      Amount: b2bAmount,
      PartyA: b2bPartyA,
      PartyB: b2bPartyB,
      AccountReference: b2bAccountRef,
      Remarks: b2bRemarks,
      QueueTimeOutURL: b2bTimeoutUrl,
      ResultURL: b2bResultUrl,
    })
  }

  const sendBalance = () => {
    const generatedSecurityCredential = getAutoSecurityCredential(initiatorName, consumerSecret)
    call("balance", `${base}/mpesa/accountbalance/v1/query`, {
      Initiator: initiatorName,
      SecurityCredential: generatedSecurityCredential,
      CommandID: "AccountBalance",
      PartyA: balShortCode,
      IdentifierType: balIdType,
      Remarks: "Balance query",
      QueueTimeOutURL: balTimeoutUrl,
      ResultURL: balResultUrl,
    })
  }

  const sendTxStatus = () => {
    const generatedSecurityCredential = getAutoSecurityCredential(initiatorName, consumerSecret)
    call("txstatus", `${base}/mpesa/transactionstatus/v1/query`, {
      Initiator: initiatorName,
      SecurityCredential: generatedSecurityCredential,
      CommandID: "TransactionStatusQuery",
      TransactionID: tsTransId,
      PartyA: tsShortCode,
      IdentifierType: tsIdType,
      ResultURL: tsResultUrl,
      QueueTimeOutURL: tsTimeoutUrl,
      Remarks: "Status check",
      Occasion: "",
    })
  }

  const sendReversal = () => {
    const generatedSecurityCredential = getAutoSecurityCredential(initiatorName, consumerSecret)
    call("reversal", `${base}/mpesa/reversal/v1/request`, {
      Initiator: initiatorName,
      SecurityCredential: generatedSecurityCredential,
      CommandID: "TransactionReversal",
      TransactionID: revTransId,
      Amount: revAmount,
      ReceiverParty: revShortCode,
      ReceiverIdentifierType: "11",
      ResultURL: revResultUrl,
      QueueTimeOutURL: revTimeoutUrl,
      Remarks: revRemarks,
      Occasion: "",
    })
  }

  const sendQR = () => {
    call("qr", `${base}/mpesa/qrcode/v1/generate`, {
      MerchantName: qrMerchantName,
      RefNo: qrRefNo,
      Amount: qrAmount,
      TrxCode: qrTrxCode,
      CPI: qrCPI,
      Size: qrSize,
    })
  }

  const sendBMOptIn = () => {
    call("bm_optin", `${base}/v1/billmanager-invoice/v1/billmanager-invoice/optin`, {
      shortcode: bmShortCode,
      email: bmEmail,
      officialContact: bmOfficialContact,
      sendReminders: "1",
      logo: bmLogo,
      callbackurl: bmCallbackUrl,
    })
  }

  const sendBMInvoice = () => {
    call("bm_invoice", `${base}/v1/billmanager-invoice/v1/billmanager-invoice/single-invoicing`, {
      externalReference: bmExtRef,
      billedFullName: bmBilledTo,
      billedPhoneNumber: bmPhone,
      billedPeriod: bmDueDate,
      invoiceName: bmBillDesc,
      dueDate: bmDueDate,
      accountReference: bmAccount,
      amount: bmInvAmount,
      invoiceItems: [{ itemName: bmBillDesc, amount: bmInvAmount }],
    })
  }

  const r = (key: string) => results[key] || null

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-muted rounded-full border border-border/50">
            <Activity className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground font-medium">Daraja API Tester — All Products</p>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-green-600 to-green-400 dark:from-green-500 dark:to-green-300 bg-clip-text text-transparent">M-Pesa</span> API Console
          </h1>
          <p className="text-muted-foreground text-sm">Test every Daraja API from one place. Set credentials once, fire any endpoint.</p>
        </div>

        {/* Environment Toggle */}
        <Card className="p-1 border border-border flex rounded-2xl bg-muted/30">
          {(["sandbox", "production"] as Environment[]).map(e => (
            <button key={e}
              onClick={() => { setEnv(e); setAuthToken(null); setTokenStatus("idle"); setResults({}) }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all capitalize ${
                env === e ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}>
              {e === "sandbox" ? "Sandbox" : "Production"}
            </button>
          ))}
        </Card>

        {/* ── Step 0: Global Credentials ──────────────────────────────────── */}
        <Card className="border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-foreground flex items-center justify-center">
                <Key className="w-4 h-4 text-background" />
              </div>
              <div>
                <p className="font-semibold text-sm">Global Credentials</p>
                <p className="text-xs text-muted-foreground">Shared across all API calls</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-3">
            <Grid2>
              <Field label="Consumer Key" value={consumerKey} onChange={setConsumerKey} placeholder="From Daraja My Apps" />
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Consumer Secret</Label>
                <Input
                  type="text"
                  value={consumerSecret}
                  onChange={e => setConsumerSecret(e.target.value)}
                  placeholder="Consumer Secret"
                  className="bg-muted/30 border-border/70 rounded-xl font-mono text-sm h-9"
                />
              </div>
            </Grid2>
            <Grid2>
              <Field label="Short Code" value={shortCode} onChange={setShortCode} placeholder="174379"
                hint="Your business short code" />
              <Field label="Passkey" value={passkey} onChange={setPasskey} placeholder="STK Push passkey" type="password" />
            </Grid2>
            <Grid2>
              <Field label="Initiator Name" value={initiatorName} onChange={setInitiatorName}
                placeholder="API operator username" hint="For B2C, B2B, Balance etc." />
              <Field
                label="Security Credential"
                value={getAutoSecurityCredential(initiatorName || "initiator", consumerSecret || "consumer-secret")}
                onChange={() => undefined}
                placeholder="Auto generated"
                hint="Auto-generated in logic for requests that require it."
                readOnly
              />
            </Grid2>

            {tokenError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-400">{tokenError}</p>
              </div>
            )}
            {authToken && isTokenValid() && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Token Active · {tokenRemaining()}</p>
                  </div>
                </div>
                <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400 truncate">{authToken.access_token}</p>
              </div>
            )}
            {authToken && !isTokenValid() && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-xs text-amber-700 dark:text-amber-400">⚠️ Token expired. Regenerate before calling APIs.</p>
              </div>
            )}

            <Button onClick={generateToken} disabled={tokenStatus === "loading"}
              className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl h-10 text-sm font-semibold">
              {tokenStatus === "loading"
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                : authToken && isTokenValid()
                  ? <><RefreshCw className="w-4 h-4 mr-2" />Refresh Token</>
                  : <><Key className="w-4 h-4 mr-2" />Generate Access Token</>}
            </Button>
          </div>
        </Card>

        {/* ── STK Push ──────────────────────────────────────────────────────── */}
        <Section icon={Zap} title="M-Pesa Express — STK Push"
          endpoint={`${base}/mpesa/stkpush/v1/processrequest`} result={r("stk")} defaultOpen>
          <Grid2>
            <Field label="Phone (PartyA)" value={stkPhone} onChange={setStkPhone} placeholder="2547XXXXXXXX" />
            <Field label="Amount (KES)" value={stkAmount} onChange={setStkAmount} placeholder="1" />
          </Grid2>
          <Grid2>
            <Field label="Party B" value={stkPartyB} onChange={setStkPartyB} placeholder="Short code or Till" />
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type</Label>
              <div className="flex gap-1.5">
                {STK_TRANSACTION_TYPES.map(t => (
                  <button key={t} onClick={() => setStkType(t)}
                    className={`flex-1 py-2 px-2 text-xs font-medium rounded-xl border transition-all ${
                      stkType === t ? "bg-foreground text-background border-foreground" : "bg-muted/30 text-muted-foreground border-border/70"
                    }`}>
                    {t === "CustomerPayBillOnline" ? "Pay Bill" : "Buy Goods"}
                  </button>
                ))}
              </div>
            </div>
          </Grid2>
          <Grid2>
            <Field label="Acct Ref (max 12)" value={stkRef} onChange={v => setStkRef(v.slice(0, 12))} placeholder="Reference" />
            <Field label="Description (max 13)" value={stkDesc} onChange={v => setStkDesc(v.slice(0, 13))} placeholder="Payment" />
          </Grid2>
          <Field label="Callback URL" value={stkCallback} onChange={setStkCallback} placeholder="https://..." />
          <ActionButton onClick={sendSTK} loading={r("stk")?.status === "loading"} label="Send STK Push" disabled={!isTokenValid()} />
        </Section>

        {/* ── STK Query ─────────────────────────────────────────────────────── */}
        <Section icon={Activity} title="STK Push Query"
          endpoint={`${base}/mpesa/stkpushquery/v1/query`} result={r("stkquery")}>
          <Field label="Checkout Request ID" value={stkQueryCheckout} onChange={setStkQueryCheckout}
            placeholder="ws_CO_..." hint="From the STK Push response" />
          <ActionButton onClick={sendSTKQuery} loading={r("stkquery")?.status === "loading"} label="Query STK Status" disabled={!isTokenValid()} />
        </Section>

        {/* ── C2B Register ──────────────────────────────────────────────────── */}
        <Section icon={CreditCard} title="C2B Register URL (v1 & v2)"
          endpoint={`${base}/mpesa/c2b/v2/registerurl`} result={r("c2b_v2")}>
          <Grid2>
            <Field label="Short Code" value={c2bShortCode} onChange={setC2bShortCode} placeholder="600000" />
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Response Type</Label>
              <div className="flex gap-1.5">
                {["Completed", "Cancelled"].map(t => (
                  <button key={t} onClick={() => setC2bResponseType(t)}
                    className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all ${
                      c2bResponseType === t ? "bg-foreground text-background border-foreground" : "bg-muted/30 text-muted-foreground border-border/70"
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </Grid2>
          <Grid2>
            <Field label="Confirmation URL" value={c2bConfirmUrl} onChange={setC2bConfirmUrl} placeholder="https://..." />
            <Field label="Validation URL" value={c2bValidationUrl} onChange={setC2bValidationUrl} placeholder="https://..." />
          </Grid2>
          <div className="flex gap-2">
            <Button onClick={() => registerC2B("v1")} disabled={!isTokenValid() || r("c2b_v1")?.status === "loading"}
              className="flex-1 bg-muted text-foreground hover:bg-muted/80 rounded-xl h-9 text-sm font-medium border border-border">
              {r("c2b_v1")?.status === "loading" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Register v1"}
            </Button>
            <Button onClick={() => registerC2B("v2")} disabled={!isTokenValid() || r("c2b_v2")?.status === "loading"}
              className="flex-1 bg-foreground text-background hover:bg-foreground/90 rounded-xl h-9 text-sm font-semibold">
              {r("c2b_v2")?.status === "loading" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Register v2"}
            </Button>
          </div>
          {r("c2b_v1")?.response !== null && (
            <div className="p-3 rounded-xl border border-border bg-muted/20">
              <p className="text-xs font-semibold text-muted-foreground mb-1">v1 response</p>
              <pre className="text-xs font-mono text-foreground overflow-auto max-h-24">{JSON.stringify(r("c2b_v1")?.response, null, 2)}</pre>
            </div>
          )}
        </Section>

        {/* ── B2C ───────────────────────────────────────────────────────────── */}
        <Section icon={Users} title="B2C — Business to Customer"
          endpoint={`${base}/mpesa/b2c/v1/paymentrequest`} result={r("b2c")}>
          <Grid2>
            <Field label="Party A (Short Code)" value={b2cShortCode} onChange={setB2cShortCode} placeholder="600000" />
            <Field label="Phone (Party B)" value={b2cPhone} onChange={setB2cPhone} placeholder="2547XXXXXXXX" />
          </Grid2>
          <Grid2>
            <Field label="Amount (KES)" value={b2cAmount} onChange={setB2cAmount} placeholder="10" />
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Command ID</Label>
              <select value={b2cCommand} onChange={e => setB2cCommand(e.target.value)}
                className="w-full h-9 bg-muted/30 border border-border/70 rounded-xl text-sm px-3 text-foreground">
                <option>BusinessPayment</option>
                <option>SalaryPayment</option>
                <option>PromotionPayment</option>
              </select>
            </div>
          </Grid2>
          <Grid2>
            <Field label="Remarks" value={b2cRemarks} onChange={setB2cRemarks} placeholder="Salary" />
            <Field label="Occasion" value={b2cOccasion} onChange={setB2cOccasion} placeholder="Optional" />
          </Grid2>
          <Grid2>
            <Field label="Result URL" value={b2cResultUrl} onChange={setB2cResultUrl} placeholder="https://..." />
            <Field label="Timeout URL" value={b2cTimeoutUrl} onChange={setB2cTimeoutUrl} placeholder="https://..." />
          </Grid2>
          <ActionButton onClick={sendB2C} loading={r("b2c")?.status === "loading"} label="Send B2C Payment" disabled={!isTokenValid()} />
        </Section>

        {/* ── B2B ───────────────────────────────────────────────────────────── */}
        <Section icon={ArrowLeftRight} title="B2B — Business to Business"
          endpoint={`${base}/mpesa/b2b/v1/paymentrequest`} result={r("b2b")}>
          <Grid2>
            <Field label="Party A (Short Code)" value={b2bPartyA} onChange={setB2bPartyA} placeholder="600000" />
            <Field label="Party B (Short Code)" value={b2bPartyB} onChange={setB2bPartyB} placeholder="600001" />
          </Grid2>
          <Grid2>
            <Field label="Amount (KES)" value={b2bAmount} onChange={setB2bAmount} placeholder="100" />
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Command ID</Label>
              <select value={b2bCommand} onChange={e => setB2bCommand(e.target.value)}
                className="w-full h-9 bg-muted/30 border border-border/70 rounded-xl text-sm px-3 text-foreground">
                <option>BusinessPayBill</option>
                <option>BusinessBuyGoods</option>
                <option>DisburseFundsToBusiness</option>
                <option>BusinessToBusinessTransfer</option>
              </select>
            </div>
          </Grid2>
          <Grid2>
            <Field label="Account Reference" value={b2bAccountRef} onChange={setB2bAccountRef} placeholder="Account001" />
            <Field label="Remarks" value={b2bRemarks} onChange={setB2bRemarks} placeholder="B2B Payment" />
          </Grid2>
          <Grid2>
            <Field label="Result URL" value={b2bResultUrl} onChange={setB2bResultUrl} placeholder="https://..." />
            <Field label="Timeout URL" value={b2bTimeoutUrl} onChange={setB2bTimeoutUrl} placeholder="https://..." />
          </Grid2>
          <ActionButton onClick={sendB2B} loading={r("b2b")?.status === "loading"} label="Send B2B Payment" disabled={!isTokenValid()} />
        </Section>

        {/* ── Account Balance ───────────────────────────────────────────────── */}
        <Section icon={Wallet} title="Account Balance"
          endpoint={`${base}/mpesa/accountbalance/v1/query`} result={r("balance")}>
          <Grid2>
            <Field label="Party A (Short Code)" value={balShortCode} onChange={setBalShortCode} placeholder="600000" />
            <Field label="Identifier Type" value={balIdType} onChange={setBalIdType} placeholder="4"
              hint="4=Org Short Code" />
          </Grid2>
          <Grid2>
            <Field label="Result URL" value={balResultUrl} onChange={setBalResultUrl} placeholder="https://..." />
            <Field label="Timeout URL" value={balTimeoutUrl} onChange={setBalTimeoutUrl} placeholder="https://..." />
          </Grid2>
          <ActionButton onClick={sendBalance} loading={r("balance")?.status === "loading"} label="Query Account Balance" disabled={!isTokenValid()} />
        </Section>

        {/* ── Transaction Status ────────────────────────────────────────────── */}
        <Section icon={BarChart3} title="Transaction Status"
          endpoint={`${base}/mpesa/transactionstatus/v1/query`} result={r("txstatus")}>
          <Grid2>
            <Field label="Transaction ID" value={tsTransId} onChange={setTsTransId} placeholder="e.g. MBN0000000" />
            <Field label="Party A (Short Code)" value={tsShortCode} onChange={setTsShortCode} placeholder="600000" />
          </Grid2>
          <Grid2>
            <Field label="Identifier Type" value={tsIdType} onChange={setTsIdType} placeholder="1"
              hint="1=MSISDN 2=TillNo 4=OrgCode" />
            <div />
          </Grid2>
          <Grid2>
            <Field label="Result URL" value={tsResultUrl} onChange={setTsResultUrl} placeholder="https://..." />
            <Field label="Timeout URL" value={tsTimeoutUrl} onChange={setTsTimeoutUrl} placeholder="https://..." />
          </Grid2>
          <ActionButton onClick={sendTxStatus} loading={r("txstatus")?.status === "loading"} label="Check Transaction Status" disabled={!isTokenValid()} />
        </Section>

        {/* ── Reversal ──────────────────────────────────────────────────────── */}
        <Section icon={Repeat} title="Transaction Reversal"
          endpoint={`${base}/mpesa/reversal/v1/request`} result={r("reversal")}>
          <Grid2>
            <Field label="Transaction ID" value={revTransId} onChange={setRevTransId} placeholder="M-Pesa Txn ID" />
            <Field label="Amount" value={revAmount} onChange={setRevAmount} placeholder="10" />
          </Grid2>
          <Grid2>
            <Field label="Receiver Short Code" value={revShortCode} onChange={setRevShortCode} placeholder="600000" />
            <Field label="Remarks" value={revRemarks} onChange={setRevRemarks} placeholder="Reversal" />
          </Grid2>
          <Grid2>
            <Field label="Result URL" value={revResultUrl} onChange={setRevResultUrl} placeholder="https://..." />
            <Field label="Timeout URL" value={revTimeoutUrl} onChange={setRevTimeoutUrl} placeholder="https://..." />
          </Grid2>
          <ActionButton onClick={sendReversal} loading={r("reversal")?.status === "loading"} label="Request Reversal" disabled={!isTokenValid()} />
        </Section>

        {/* ── Dynamic QR Code ───────────────────────────────────────────────── */}
        <Section icon={QrCode} title="Dynamic QR Code"
          endpoint={`${base}/mpesa/qrcode/v1/generate`} result={r("qr")}>
          <Grid2>
            <Field label="Merchant Name" value={qrMerchantName} onChange={setQrMerchantName} placeholder="Paysuit Ltd" />
            <Field label="Ref No" value={qrRefNo} onChange={setQrRefNo} placeholder="QR001" />
          </Grid2>
          <Grid2>
            <Field label="Amount (KES)" value={qrAmount} onChange={setQrAmount} placeholder="100" />
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Transaction Code</Label>
              <select value={qrTrxCode} onChange={e => setQrTrxCode(e.target.value)}
                className="w-full h-9 bg-muted/30 border border-border/70 rounded-xl text-sm px-3 text-foreground">
                <option value="BG">BG — Buy Goods</option>
                <option value="WA">WA — Withdraw Agent</option>
                <option value="PB">PB — Pay Bill</option>
                <option value="SM">SM — Send Money</option>
                <option value="SB">SB — Send to Business</option>
              </select>
            </div>
          </Grid2>
          <Grid2>
            <Field label="CPI (Short Code / Till)" value={qrCPI} onChange={setQrCPI} placeholder="174379" />
            <Field label="QR Size (px)" value={qrSize} onChange={setQrSize} placeholder="300" />
          </Grid2>
          <ActionButton onClick={sendQR} loading={r("qr")?.status === "loading"} label="Generate QR Code" disabled={!isTokenValid()} />
          {r("qr")?.status === "success" && (r("qr")?.response as { QRCode?: string })?.QRCode && (
            <div className="flex justify-center p-4 bg-white rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`data:image/png;base64,${(r("qr")?.response as { QRCode?: string })?.QRCode}`}
                alt="QR Code" className="w-48 h-48" />
            </div>
          )}
        </Section>

        {/* ── Bill Manager ─────────────────────────────────────────────────── */}
        <Section icon={FileText} title="Bill Manager — Opt-In"
          endpoint={`${base}/v1/billmanager-invoice/v1/billmanager-invoice/optin`} result={r("bm_optin")}>
          <Grid2>
            <Field label="Short Code" value={bmShortCode} onChange={setBmShortCode} placeholder="600000" />
            <Field label="Email" value={bmEmail} onChange={setBmEmail} placeholder="billing@company.com" />
          </Grid2>
          <Grid2>
            <Field label="Official Contact" value={bmOfficialContact} onChange={setBmOfficialContact} placeholder="254722000000" />
            <Field label="Logo URL" value={bmLogo} onChange={setBmLogo} placeholder="https://..." />
          </Grid2>
          <Field label="Callback URL" value={bmCallbackUrl} onChange={setBmCallbackUrl} placeholder="https://..." />
          <ActionButton onClick={sendBMOptIn} loading={r("bm_optin")?.status === "loading"} label="Opt In to Bill Manager" disabled={!isTokenValid()} />
        </Section>

        <Section icon={FileText} title="Bill Manager — Single Invoice"
          endpoint={`${base}/v1/billmanager-invoice/v1/billmanager-invoice/single-invoicing`} result={r("bm_invoice")}>
          <Grid2>
            <Field label="External Reference" value={bmExtRef} onChange={setBmExtRef} placeholder="INV001" />
            <Field label="Account Reference" value={bmAccount} onChange={setBmAccount} placeholder="ACC001" />
          </Grid2>
          <Grid2>
            <Field label="Billed Full Name" value={bmBilledTo} onChange={setBmBilledTo} placeholder="John Doe" />
            <Field label="Phone" value={bmPhone} onChange={setBmPhone} placeholder="254722000000" />
          </Grid2>
          <Grid2>
            <Field label="Amount (KES)" value={bmInvAmount} onChange={setBmInvAmount} placeholder="1000" />
            <Field label="Due Date" value={bmDueDate} onChange={setBmDueDate} placeholder="2025-12-31" />
          </Grid2>
          <Field label="Invoice Description" value={bmBillDesc} onChange={setBmBillDesc} placeholder="Invoice for services" />
          <ActionButton onClick={sendBMInvoice} loading={r("bm_invoice")?.status === "loading"} label="Send Single Invoice" disabled={!isTokenValid()} />
        </Section>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pb-8">
          Credentials stay in-browser only. Requests are proxied server-side via <code className="font-mono">/api/mpesa/proxy</code>.
        </p>
      </div>
    </div>
  )
}
