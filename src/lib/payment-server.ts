export type PaymentFlow = "PAYSUIT_RECHARGE" | "MALIPO_C2B"
export type PaymentProvider = "PAYSUIT" | "MALIPO"

export type StkPushRequest = {
  flow: PaymentFlow
  provider: PaymentProvider
  userId: string
  phoneNumber: string
  amount: number
  currency: "KES"
  clientRequestId: string
  websocketSessionId?: string
}

export type StkPushResponse = {
  paymentId?: string
  checkoutRequestID?: string
  CheckoutRequestID?: string
  CustomerMessage?: string
  ResponseDescription?: string
  error?: string
  errorMessage?: string
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "")

export function getPaymentServerUrl() {
  return trimTrailingSlash(process.env.NEXT_PUBLIC_PAYMENT_SERVER_URL || "")
}

export function getPaymentWebSocketUrl(websocketSessionId: string) {
  const baseUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_PAYMENT_WS_URL || "")
  if (!baseUrl) return ""

  const url = new URL(`${baseUrl}/v1/ws/payments`)
  url.searchParams.set("websocketSessionId", websocketSessionId)
  return url.toString()
}

export function isBasicPhoneNumber(phoneNumber: string) {
  return /^(?:\+?254|0)?7\d{8}$/.test(phoneNumber.trim())
}

export async function createWebsocketSession() {
  const response = await fetch("/api/payments/ws-session", { method: "POST" })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to create payment WebSocket session")
  }

  return data.websocketSessionId as string
}

export async function initiateStkPush(request: StkPushRequest) {
  const baseUrl = getPaymentServerUrl()
  if (!baseUrl) {
    throw new Error("Payment server URL is not configured")
  }

  const response = await fetch(`${baseUrl}/v1/payments/stkpush`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })

  const data = (await response.json()) as StkPushResponse
  if (!response.ok) {
    throw new Error(data.error || data.errorMessage || "STK Push request failed")
  }

  return data
}
