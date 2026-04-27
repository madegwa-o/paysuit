"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { User, Bell, Shield, Loader2, Key, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import ApiKeysManager from "@/components/api-keys-manager"

export default function AccountPage() {
  const { data: session, status } = useSession()
  const { isSupported, isSubscribed, subscribeToPush, unsubscribeFromPush } = usePushNotifications()
  const router = useRouter()
  const [emailNotifications, setEmailNotifications] = useState(() => {
    if (typeof window === "undefined") return true
    const stored = localStorage.getItem("paysuit.emailNotifications")
    return stored === null ? true : stored === "true"
  })
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [isSettingPassword, setIsSettingPassword] = useState(false)
  const [isProcessingPush, setIsProcessingPush] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [shareMessage, setShareMessage] = useState<string | null>(null)
  const [dangerLoading, setDangerLoading] = useState<"history" | "account" | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin?callbackUrl=/account")
    }
  }, [status, router])


  useEffect(() => {
    localStorage.setItem("paysuit.emailNotifications", String(emailNotifications))
  }, [emailNotifications])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/user/profile")
        if (!res.ok) return
        const data = await res.json()
        setName(data.name || "")
        setPhone(data.phone || "")
      } catch {
        // noop
      }
    }

    if (status === "authenticated") {
      const id = setTimeout(() => { void loadProfile() }, 0)
      return () => clearTimeout(id)
    }
  }, [status])

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    setIsSettingPassword(true)

    try {
      const response = await fetch("/api/user/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setPasswordError(data.error || "Failed to set password")
      } else {
        setPasswordSuccess("Password set successfully! You can now sign in with email and password.")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch {
      setPasswordError("An error occurred. Please try again.")
    } finally {
      setIsSettingPassword(false)
    }
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    setProfileError(null)
    setProfileMessage(null)

    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      })
      const data = await response.json()

      if (!response.ok) {
        setProfileError(data.error || "Failed to save profile")
        return
      }

      setProfileMessage("Profile updated successfully.")
    } catch {
      setProfileError("Unable to save your profile right now.")
    } finally {
      setSavingProfile(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleToggle = async (checked: boolean) => {
    setIsProcessingPush(true)
    try {
      if (checked) {
        await subscribeToPush()
      } else {
        await unsubscribeFromPush()
      }
    } finally {
      setIsProcessingPush(false)
    }
  }

  const handleShare = async () => {
    const payload = {
      title: "Paysuit",
      text: "Manage wallet and managed paywall transactions with Paysuit.",
      url: "https://malipo.app",
    }

    try {
      if (navigator.share) {
        await navigator.share(payload)
      } else {
        await navigator.clipboard.writeText(payload.url)
      }
      setShareMessage("Share link ready.")
    } catch {
      setShareMessage("Share cancelled.")
    }
  }

  const handleDeleteHistory = async () => {
    setDangerLoading("history")
    try {
      await fetch("/api/user/transactions", { method: "DELETE" })
    } finally {
      setDangerLoading(null)
    }
  }

  const handleDeleteAccount = async () => {
    setDangerLoading("account")
    try {
      const response = await fetch("/api/user/account", { method: "DELETE" })
      if (response.ok) {
        await signOut({ callbackUrl: "/" })
      }
    } finally {
      setDangerLoading(null)
    }
  }

  return (
    <main className="container px-4 py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-bold text-3xl mb-2">My Account</h1>
        <p className="text-muted-foreground">Manage your profile, API keys, and account settings.</p>
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>Manage a single API key for all integration endpoints.</CardDescription>
            </CardHeader>
            <CardContent>
              <ApiKeysManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information and contact details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileError && <Alert variant="destructive"><AlertDescription>{profileError}</AlertDescription></Alert>}
              {profileMessage && <Alert><AlertDescription>{profileMessage}</AlertDescription></Alert>}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue={session.user?.email || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+254 700 000 000" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <Button onClick={handleSaveProfile} disabled={savingProfile}>{savingProfile ? "Saving..." : "Save Changes"}</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Set Up Password
              </CardTitle>
              <CardDescription>Set up a password to enable email/password sign-in.</CardDescription>
            </CardHeader>
            <CardContent>
              {passwordError && <Alert variant="destructive" className="mb-4"><AlertDescription>{passwordError}</AlertDescription></Alert>}
              {passwordSuccess && <Alert className="mb-4 border-primary bg-primary/10"><AlertDescription className="text-primary">{passwordSuccess}</AlertDescription></Alert>}
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isSettingPassword} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSettingPassword} required />
                </div>
                <Button type="submit" disabled={isSettingPassword}>{isSettingPassword ? "Setting Password..." : "Set Password"}</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="share" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share Paysuit
              </CardTitle>
              <CardDescription>Invite your team and developers to Paysuit.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleShare} variant="outline" className="w-full">Share or Copy Link</Button>
              {shareMessage && <p className="text-sm text-muted-foreground">{shareMessage}</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Manage how you receive notifications from Paysuit.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-muted-foreground text-sm">Receive transaction summaries and updates</p>
                </div>
                <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-muted-foreground text-sm">{isSubscribed ? "You're subscribed to important payment updates." : "Get alerts for payment updates."}</p>
                </div>

                {isProcessingPush ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : (
                  <Switch id="push-notifications" disabled={!isSupported} checked={isSubscribed} onCheckedChange={handleToggle} />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions for your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Delete All Transaction History</p>
                  <p className="text-muted-foreground text-xs">This action cannot be undone</p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDeleteHistory} disabled={dangerLoading !== null}>
                  {dangerLoading === "history" ? "Deleting..." : "Delete History"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Delete Account</p>
                  <p className="text-muted-foreground text-xs">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDeleteAccount} disabled={dangerLoading !== null}>
                  {dangerLoading === "account" ? "Deleting..." : "Delete Account"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
