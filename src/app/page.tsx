import Link from "next/link"
import { ArrowRight, Zap, Shield, Gauge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col">
            {/* Hero Section */}
            <section className="flex-1 flex items-center justify-center px-4 py-20">
                <div className="max-w-3xl w-full text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
                        M-Pesa Payment Integration
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
                        Build payment solutions with Paysuit. Access M-Pesa APIs, manage transactions, and scale your fintech business.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" asChild>
                            <Link href="/api-testing">
                                Test Daraja APIs
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/docs">Documentation</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="px-4 py-16 border-t">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Why Paysuit?</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <Zap className="h-8 w-8 text-primary mb-2" />
                                <CardTitle>Fast Integration</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Get started with M-Pesa APIs in minutes. Test your credentials with our built-in testing tool.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Shield className="h-8 w-8 text-primary mb-2" />
                                <CardTitle>Secure & Reliable</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Enterprise-grade security with encrypted credential storage and secure API communication.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Gauge className="h-8 w-8 text-primary mb-2" />
                                <CardTitle>Multiple APIs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Support for STK Push, B2C, B2B, Transaction Status, and Account Balance APIs.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-4 py-16 border-t">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
                    <p className="text-muted-foreground mb-8">
                        Test your Daraja API credentials instantly without building any code.
                    </p>
                    <Button size="lg" asChild>
                        <Link href="/api-testing">
                            Try API Testing Tool
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </section>
        </main>
    )
}
