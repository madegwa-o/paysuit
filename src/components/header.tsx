"use client"

import { useState } from "react"
import {Sun , Moon} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Header() {
    const [isDarkMode, setIsDarkMode] = useState(false)

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode)
        if (typeof window !== "undefined") {
            const html = document.documentElement
            if (isDarkMode) {
                html.classList.remove("dark")
                localStorage.setItem("theme", "light")
            } else {
                html.classList.add("dark")
                localStorage.setItem("theme", "dark")
            }
        }
    }

    return (
        <header className="border-b border-border/30 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
                    <div className="w-8 h-8 bg-foreground rounded flex items-center justify-center">
                        <span className="text-background font-bold text-lg">P</span>
                    </div>
                    <span className="font-semibold text-lg">PayFlow</span>
                </Link>

                <nav className="hidden md:flex gap-8">
                    <Link href="#products" className="text-foreground/70 hover:text-foreground transition text-sm">
                        Products
                    </Link>
                    <Link href="/dashboard" className="text-foreground/70 hover:text-foreground transition text-sm">
                        Solutions
                    </Link>
                    <Link href="/docs" className="text-foreground/70 hover:text-foreground transition text-sm">
                        Developers
                    </Link>
                    <Link href="#pricing" className="text-foreground/70 hover:text-foreground transition text-sm">
                        Pricing
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <button onClick={toggleTheme} className="p-2 hover:bg-muted rounded-lg transition" aria-label="Toggle theme">
                        {isDarkMode ? <Sun /> : <Moon />}
                    </button>
                    <Button variant="ghost" className="text-foreground/70 hover:text-foreground">
                        Sign in
                    </Button>
                    <Button className="bg-foreground text-background hover:bg-foreground/90">Contact sales</Button>
                </div>
            </div>
        </header>
    )
}
