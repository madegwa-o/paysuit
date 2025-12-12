import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, MessageSquare, ScanLine, Shield, Activity, FileText } from "lucide-react"

export default function DocsPage() {
    return (
        <main className="container px-4 py-16 max-w-4xl mx-auto">
            <div className="mb-12">
                <h1 className="font-bold text-4xl mb-4">Documentation</h1>
                <p className="text-muted-foreground text-lg">
                    Learn how to integrate and use <strong>Malipo</strong> to collect payments securely through M-Pesa.
                </p>
            </div>

            <Alert className="mb-8 border-primary/50 bg-primary/5">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertDescription>
                    <strong>Important:</strong> Malipo is a paywall and payment API provider that connects seamlessly with
                    M-Pesa. Always test your integrations using the M-Pesa Sandbox before going live with production credentials.
                </AlertDescription>
            </Alert>

            <div className="space-y-8">
                <section>
                    <h2 className="font-bold text-2xl mb-4 flex items-center gap-2">
                        <Activity className="h-6 w-6 text-primary" />
                        Getting Started
                    </h2>
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">What is Malipo?</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Malipo is a payment infrastructure designed for developers and businesses that want to
                                    monetize content or services using M-Pesa. It provides a unified API for initiating STK Pushes,
                                    handling callbacks, and managing subscription paywalls.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Setup Guide</h3>
                                <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
                                    <li>Sign up and create your organization on the Malipo dashboard</li>
                                    <li>Obtain your <strong>Consumer Key</strong> and <strong>Consumer Secret</strong></li>
                                    <li>Register your <strong>Callback URL</strong></li>
                                    <li>Use your credentials to initiate a payment request</li>
                                    <li>Monitor transaction status via webhooks or dashboard</li>
                                </ol>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="font-bold text-2xl mb-4 flex items-center gap-2">
                        <MessageSquare className="h-6 w-6 text-primary" />
                        STK Push Requests
                    </h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>How It Works</CardTitle>
                            <CardDescription>Initiate and handle real-time M-Pesa payment prompts</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Key Parameters</h3>
                                <ul className="space-y-2 text-muted-foreground text-sm">
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span><strong>PhoneNumber</strong> – The customer’s M-Pesa number (format: 2547XXXXXXXX)</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span><strong>Amount</strong> – The amount to be charged in KES</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span><strong>AccountReference</strong> – A short label for your transaction (e.g. &#34;Monthly Plan&#34;)</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span><strong>CallbackURL</strong> – Endpoint to receive M-Pesa transaction result</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Response Structure</h3>
                                <ul className="space-y-2 text-muted-foreground text-sm">
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span><strong>ResponseCode</strong> – 0 means success (request accepted for processing)</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span><strong>MerchantRequestID</strong> and <strong>CheckoutRequestID</strong> – Track your transaction</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span><strong>CustomerMessage</strong> – User-facing message shown on phone (e.g. &#34;Enter your M-Pesa PIN&#34;)</span>
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="font-bold text-2xl mb-4 flex items-center gap-2">
                        <ScanLine className="h-6 w-6 text-primary" />
                        Callbacks & Validation
                    </h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Receiving Transaction Results</CardTitle>
                            <CardDescription>Handle confirmations and validation for your payments</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Callback Payload</h3>
                                <ul className="space-y-2 text-muted-foreground text-sm">
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span><strong>ResultCode</strong> – 0 (success), any other value means failure</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span><strong>MpesaReceiptNumber</strong> – The unique transaction ID (e.g. QER5N7R4KL)</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span><strong>TransactionDate</strong> – Timestamp of successful payment</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span><strong>Amount</strong> and <strong>PhoneNumber</strong> – Confirm payment details</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Verification Tips</h3>
                                <ul className="space-y-2 text-muted-foreground text-sm">
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span>Always validate <strong>ResultCode</strong> before crediting accounts</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">•</span>
                                        <span>Use <strong>MpesaReceiptNumber</strong> to prevent duplicate processing</span>
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="font-bold text-2xl mb-4 flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        Security & Authentication
                    </h2>
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Access Tokens</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    All API requests are authenticated using OAuth 2.0. Use your Consumer Key and Consumer Secret to
                                    generate a Bearer Token from the M-Pesa Daraja API. The token expires after one hour.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Certificate Encryption</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Malipo automatically encrypts your payloads using the official M-Pesa public certificate. Always ensure
                                    you are using the correct <strong>ProductionCertificate.cer</strong> or Sandbox certificate for your environment.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="font-bold text-2xl mb-4 flex items-center gap-2">
                        <FileText className="h-6 w-6 text-primary" />
                        Important Information
                    </h2>
                    <Card className="border-destructive/50">
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2 text-destructive">Common Errors</h3>
                                <ul className="space-y-1 text-muted-foreground text-sm">
                                    <li className="flex gap-2"><span className="text-destructive">•</span><span><strong>1032:</strong> Invalid credentials</span></li>
                                    <li className="flex gap-2"><span className="text-destructive">•</span><span><strong>2001:</strong> Insufficient balance</span></li>
                                    <li className="flex gap-2"><span className="text-destructive">•</span><span><strong>4005:</strong> Request timeout – retry after 5s</span></li>
                                    <li className="flex gap-2"><span className="text-destructive">•</span><span><strong>9999:</strong> Internal system error – contact support</span></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Testing & Sandbox</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Always test your integration using the M-Pesa Sandbox before moving to production. You can simulate
                                    transactions, verify callbacks, and confirm your application logic without real money transfers.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </main>
    )
}
