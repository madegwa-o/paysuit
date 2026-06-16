"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Send, AlertCircle, CheckCircle2, Circle } from "lucide-react"

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error"

interface Message {
  id: string
  name: string
  message: string
  isOwn: boolean
  timestamp: number
}

export default function ChatPage() {
  const [displayName, setDisplayName] = useState("")
  const [nameSubmitted, setNameSubmitted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting")
  const [errorMessage, setErrorMessage] = useState("")
  
  const socketRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Initialize WebSocket connection
  useEffect(() => {
    if (!nameSubmitted) return

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    if (!backendUrl) {
      setConnectionStatus("error")
      setErrorMessage("Backend URL not configured")
      return
    }

    // Derive WebSocket URL
    const wsUrl = backendUrl
      .replace("https://", "wss://")
      .replace("http://", "ws://")

    try {
      const socket = new WebSocket(`${wsUrl}/room?room=public`)

      socket.onopen = () => {
        setConnectionStatus("connected")
        setErrorMessage("")
        console.log("[v0] WebSocket connected")
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const newMessage: Message = {
            id: `${Date.now()}-${Math.random()}`,
            name: data.name,
            message: data.message,
            isOwn: data.name === displayName,
            timestamp: Date.now(),
          }
          setMessages((prev) => [...prev, newMessage])
        } catch (error) {
          console.error("[v0] Error parsing message:", error)
        }
      }

      socket.onerror = () => {
        setConnectionStatus("error")
        setErrorMessage("Connection error occurred")
        console.error("[v0] WebSocket error")
      }

      socket.onclose = () => {
        setConnectionStatus("disconnected")
        console.log("[v0] WebSocket disconnected")
      }

      socketRef.current = socket

      return () => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.close()
        }
      }
    } catch (error) {
      setConnectionStatus("error")
      setErrorMessage("Failed to create WebSocket connection")
      console.error("[v0] WebSocket creation error:", error)
    }
  }, [nameSubmitted, displayName])

  const handleSendMessage = useCallback((e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    if (!inputValue.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return
    }

    try {
      const messageData = JSON.stringify({
        name: displayName,
        message: inputValue.trim(),
      })
      socketRef.current.send(messageData)
      setInputValue("")
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      setErrorMessage("Failed to send message")
    }
  }, [inputValue, displayName])

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (displayName.trim()) {
      setNameSubmitted(true)
    }
  }

  // Name entry screen
  if (!nameSubmitted) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg border border-border p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-foreground mb-2">Public Chat Room</h1>
            <p className="text-muted-foreground mb-6">Enter your display name to join the conversation</p>
            
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!displayName.trim()}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Enter Chat
              </button>
            </form>
          </div>
        </div>
      </main>
    )
  }

  // Chat screen
  return (
    <main className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-foreground">Public Chat</h1>
            <p className="text-sm text-muted-foreground">Chatting as {displayName}</p>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {connectionStatus === "connected" && (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400">Connected</span>
              </>
            )}
            {connectionStatus === "connecting" && (
              <>
                <Circle className="w-5 h-5 text-yellow-500 animate-pulse" />
                <span className="text-sm text-yellow-600 dark:text-yellow-400">Connecting...</span>
              </>
            )}
            {connectionStatus === "disconnected" && (
              <>
                <Circle className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-muted-foreground">Disconnected</span>
              </>
            )}
            {connectionStatus === "error" && (
              <>
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-600 dark:text-red-400">Connection Error</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-xs lg:max-w-md xl:max-w-lg`}>
              {!msg.isOwn && (
                <p className="text-xs font-semibold text-muted-foreground mb-1 px-4">
                  {msg.name}
                </p>
              )}
              <div
                className={`px-4 py-2 rounded-lg ${
                  msg.isOwn
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-secondary text-secondary-foreground rounded-bl-none"
                }`}
              >
                <p className="break-words text-sm">{msg.message}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-destructive/10 border-t border-destructive text-destructive text-sm p-3">
          {errorMessage}
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-border bg-card p-4 shadow-sm"
      >
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={connectionStatus !== "connected"}
            className="flex-1 px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={connectionStatus !== "connected" || !inputValue.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </form>
    </main>
  )
}
