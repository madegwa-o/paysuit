"use client"

import { useState } from "react"
import { Share2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ShareComponentProps {
    shopId?: string
    productId?: string
    shopName?: string
    productName?: string
    shopImage?: string
    productPrice?: number
    ownerName?: string
    ownerAddress?: string
    variant?: "modal" | "buttons"
}

export default function ShareComponent({
                                           shopId,
                                           productId,
                                           shopName,
                                           productName,
                                           productPrice,
                                           ownerAddress,
                                           variant = "buttons",

                                       }: ShareComponentProps) {
    const [copied, setCopied] = useState(false)

    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const shareUrl = shopId ? `${baseUrl}/shop/${shopId}` : productId ? `${baseUrl}/product/${productId}` : baseUrl


    const title = productName || shopName || "Check this out on Duka"
    const description = productName
        ? `${productName} - sh${productPrice?.toFixed(2)} from ${shopName}`
        : `${shopName}${ownerAddress ? ` in ${ownerAddress}` : ""}`

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy:", err)
        }
    }

    const shareToWhatsApp = () => {
        const text = `${title}\n${description}\n\n${shareUrl}`
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
        window.open(whatsappUrl, "_blank")
    }

    const shareToTwitter = () => {
        const text = `${title} - ${description}`
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
        window.open(twitterUrl, "_blank")
    }

    const shareToFacebook = () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        window.open(facebookUrl, "_blank")
    }

    if (variant === "modal") {
        return (
            <div className="flex flex-col gap-3">
                <Button
                    onClick={shareToWhatsApp}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 bg-transparent"
                >
                    <Share2 className="h-4 w-4" />
                    WhatsApp
                </Button>
                <Button
                    onClick={shareToTwitter}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 bg-transparent"
                >
                    <Share2 className="h-4 w-4" />
                    Twitter
                </Button>
                <Button
                    onClick={shareToFacebook}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 bg-transparent"
                >
                    <Share2 className="h-4 w-4" />
                    Facebook
                </Button>
                <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 bg-transparent"
                >
                    {copied ? (
                        <>
                            <Check className="h-4 w-4" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="h-4 w-4" />
                            Copy Link
                        </>
                    )}
                </Button>
            </div>
        )
    }

    return (
        <div className="flex gap-2">
            <Button onClick={shareToWhatsApp} size="sm" variant="outline" className="gap-2 bg-transparent">
                <Share2 className="h-4 w-4" />
                WhatsApp
            </Button>
            <Button onClick={handleCopyLink} size="sm" variant="outline" className="gap-2 bg-transparent">
                {copied ? (
                    <>
                        <Check className="h-4 w-4" />
                        Copied
                    </>
                ) : (
                    <>
                        <Copy className="h-4 w-4" />
                        Share
                    </>
                )}
            </Button>
        </div>
    )
}
