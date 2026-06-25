import { useCallback, useRef, useState } from "react"
import { createWebsocketSession, getPaymentWebSocketUrl } from "@/lib/payment-server"

export type PaymentReceipt = {
  mpesaReceiptNumber?: string
  amount?: number
  transactionDate?: string
}

export type PaymentEvent = {
  type: "payment.accepted" | "payment.succeeded" | "payment.failed" | "payment.timeout" | "connected" | "ready"
  paymentId?: string
  checkoutRequestID?: string
  clientRequestId?: string
  resultDesc?: string
  mpesaReceiptNumber?: string
  amount?: number
  transactionDate?: string
}

type SubscribeMessage = {
  type: "subscribe_payment"
  paymentId?: string
  checkoutRequestID?: string
  clientRequestId: string
}

type Options = {
  onAccepted?: () => void
  onSucceeded?: (receipt: PaymentReceipt) => void
  onFailed?: (message: string) => void
  onTimeout?: () => void
  onOutage?: (message: string) => void
}

export function usePaymentWebSocket(options: Options = {}) {
  const socketRef = useRef<WebSocket | null>(null)
  const clientRequestIdRef = useRef<string | null>(null)
  const websocketSessionIdRef = useRef<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isFallbackRequired, setIsFallbackRequired] = useState(false)

  const sendSubscription = useCallback((message: SubscribeMessage) => {
    const socket = socketRef.current
    if (!socket || socket.readyState !== WebSocket.OPEN) return false

    socket.send(JSON.stringify(message))
    return true
  }, [])

  const close = useCallback(() => {
    socketRef.current?.close()
    socketRef.current = null
    setIsConnected(false)
  }, [])

  const connectAndSubscribe = useCallback(async (clientRequestId: string) => {
    if (typeof WebSocket === "undefined") {
      setIsFallbackRequired(true)
      throw new Error("WebSocket is unavailable in this browser")
    }

    const websocketSessionId = await createWebsocketSession()
    const websocketUrl = getPaymentWebSocketUrl(websocketSessionId)
    if (!websocketUrl) {
      throw new Error("Payment WebSocket URL is not configured")
    }

    clientRequestIdRef.current = clientRequestId
    websocketSessionIdRef.current = websocketSessionId

    await new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(websocketUrl)
      socketRef.current = socket

      const failTimer = window.setTimeout(() => {
        reject(new Error("Timed out waiting for payment WebSocket readiness"))
        socket.close()
      }, 10000)

      let isReady = false
      const markReady = () => {
        if (isReady) return

        isReady = true
        window.clearTimeout(failTimer)
        setIsConnected(true)
        sendSubscription({ type: "subscribe_payment", clientRequestId })
        resolve()
      }

      socket.onopen = () => {
        // The Go payment server confirms authentication/readiness with a message.
      }
      socket.onerror = () => {
        window.clearTimeout(failTimer)
        setIsFallbackRequired(true)
        reject(new Error("Unable to connect to payment WebSocket"))
      }
      socket.onclose = () => {
        setIsConnected(false)
        if (clientRequestIdRef.current) {
          setIsFallbackRequired(true)
          options.onOutage?.("Payment updates disconnected. Falling back to status checks when available.")
        }
      }
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as PaymentEvent
          if (data.type === "connected" || data.type === "ready") {
            markReady()
            return
          }
          if (!isReady) return
          if (data.type === "payment.accepted") options.onAccepted?.()
          if (data.type === "payment.succeeded") {
            options.onSucceeded?.({
              mpesaReceiptNumber: data.mpesaReceiptNumber,
              amount: data.amount,
              transactionDate: data.transactionDate,
            })
            close()
          }
          if (data.type === "payment.failed") {
            options.onFailed?.(data.resultDesc || "Payment failed. Please check the phone prompt and try again.")
            close()
          }
          if (data.type === "payment.timeout") {
            options.onTimeout?.()
            close()
          }
        } catch {
          // Ignore non-JSON heartbeat frames from the payment server.
        }
      }
    })

    return websocketSessionId
  }, [close, options, sendSubscription])

  const upgradeSubscription = useCallback((paymentId?: string, checkoutRequestID?: string) => {
    const clientRequestId = clientRequestIdRef.current
    if (!clientRequestId) return false

    return sendSubscription({
      type: "subscribe_payment",
      paymentId,
      checkoutRequestID,
      clientRequestId,
    })
  }, [sendSubscription])

  return {
    isConnected,
    isFallbackRequired,
    connectAndSubscribe,
    upgradeSubscription,
    close,
  }
}
