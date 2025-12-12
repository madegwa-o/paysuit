import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function PricingPage() {
    const plans = [
        {
            name: "Starter",
            price: "KES 0",
            description: "Perfect for testing and low-volume merchants",
            features: [
                "Up to 50 transactions per month",
                "Access to sandbox environment",
                "STK Push (C2B) test integration",
                "Basic analytics dashboard",
            ],
            cta: "Get Started",
            href: "/register",
            popular: false,
        },
        {
            name: "Business",
            price: "KES 2,999",
            description: "Best for small & medium businesses",
            features: [
                "Up to 5,000 transactions per month",
                "Live M-Pesa integration (C2B, B2C, B2B)",
                "Real-time webhook notifications",
                "Transaction reports & exports",
                "Priority email & WhatsApp support",
                "Automatic reconciliation tools",
            ],
            cta: "Subscribe Now",
            href: "/account",
            popular: true,
        },
        {
            name: "Enterprise",
            price: "Custom",
            description: "For banks, fintechs & large-scale merchants",
            features: [
                "Unlimited transactions",
                "Dedicated M-Pesa channel setup",
                "Custom callback routing & KYC verification",
                "Multi-shortcode & Paybill support",
                "24/7 dedicated support team",
                "On-premise or cloud deployment options",
            ],
            cta: "Contact Sales",
            href: "/contact",
            popular: false,
        },
    ]

    return (
        <main className="container px-4 py-16 max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="font-bold text-4xl md:text-5xl mb-4 text-balance">M-Pesa Paywall Pricing</h1>
                <p className="text-muted-foreground text-lg text-balance max-w-2xl mx-auto">
                    Choose a plan that fits your transaction volume. All plans include access to Daraja APIs and secure payment processing.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 mb-16">
                {plans.map((plan) => (
                    <Card
                        key={plan.name}
                        className={`relative flex flex-col ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                                    Most Popular
                                </span>
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="text-2xl">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                            <div className="mt-4">
                                <span className="font-bold text-4xl">{plan.price}</span>
                                <span className="text-muted-foreground">{plan.price !== "Custom" ? "/month" : ""}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex gap-3">
                                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full" variant={plan.popular ? "default" : "outline"}>
                                <Link href={plan.href}>
                                    {plan.cta}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                    <div className="grid gap-8 md:grid-cols-2">
                        <div>
                            <h3 className="font-semibold text-lg mb-3">Custom Integrations</h3>
                            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                                Need a tailored payment gateway, split settlements, or wallet-based payouts? Our team can design and deploy custom M-Pesa integrations for your business or platform.
                            </p>
                            <Button variant="outline" asChild className="bg-transparent">
                                <Link href="/contact">Talk to Us</Link>
                            </Button>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-3">Frequently Asked Questions</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="font-medium mb-1">Do you charge per transaction?</p>
                                    <p className="text-muted-foreground">
                                        Yes — beyond your plan limit, a small fee (KSh 0.50–1.00) per transaction applies.
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium mb-1">Which M-Pesa APIs are supported?</p>
                                    <p className="text-muted-foreground">
                                        C2B (STK Push), B2C, B2B, Transaction Status, and Account Balance APIs.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
