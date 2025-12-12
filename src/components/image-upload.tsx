"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, ImageIcon, X } from "lucide-react"
import { Card } from "@/components/ui/card"

export function ImageUpload() {
    const [image, setImage] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImage(file)
            setResult(null)
            setError(null)

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }, [])

    const handleAnalyze = useCallback(async () => {
        if (!image) return

        setAnalyzing(true)
        setError(null)
        setResult(null)

        try {
            // Convert image to base64
            const reader = new FileReader()
            reader.readAsDataURL(image)

            reader.onloadend = async () => {
                const base64Image = reader.result as string

                // Call Hugging Face API
                const response = await fetch("/api/analyze", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ image: base64Image }),
                })

                if (!response.ok) {
                    throw new Error("Analysis failed")
                }

                const data = await response.json()
                setResult(data.analysis)
            }
        } catch (err) {
            console.error("[v0] Analysis error:", err)
            setError("Failed to analyze image. Please try again.")
        } finally {
            setAnalyzing(false)
        }
    }, [image])

    const handleClear = useCallback(() => {
        setImage(null)
        setPreview(null)
        setResult(null)
        setError(null)
    }, [])

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            {!preview ? (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 transition-colors hover:bg-muted/50">
                    <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="mb-2 font-sans text-lg font-semibold text-foreground">Click to upload image</p>
                    <p className="text-sm text-muted-foreground">JPG, PNG, or WEBP (max 10MB)</p>
                    <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
                </label>
            ) : (
                <Card className="relative overflow-hidden p-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 z-10"
                        onClick={handleClear}
                        disabled={analyzing}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <img
                        src={preview || "/placeholder.svg"}
                        alt="Preview"
                        className="mx-auto max-h-96 rounded-lg object-contain"
                    />
                </Card>
            )}

            {/* Analyze Button */}
            {preview && !result && (
                <Button onClick={handleAnalyze} disabled={analyzing || !image} size="lg" className="w-full">
                    {analyzing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing Image...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            Analyze Image
                        </>
                    )}
                </Button>
            )}

            {/* Error Message */}
            {error && (
                <Card className="border-destructive bg-destructive/10 p-4">
                    <p className="text-sm text-destructive">{error}</p>
                </Card>
            )}

            {/* Results */}
            {result && (
                <Card className="p-6">
                    <h3 className="mb-4 font-sans text-xl font-semibold text-card-foreground">Analysis Results</h3>
                    <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                        <p className="whitespace-pre-wrap leading-relaxed text-foreground">{result}</p>
                    </div>
                    <Button onClick={handleClear} variant="outline" className="mt-4 w-full bg-transparent">
                        Analyze Another Image
                    </Button>
                </Card>
            )}
        </div>
    )
}
