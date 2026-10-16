"use client"

import * as React from "react"

type Theme = "dark" | "light" | "system"
type ResolvedTheme = "dark" | "light"

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

type ThemeProviderState = {
    theme: Theme
    /** The actual light/dark value currently applied — resolves "system" to whatever the OS reports. Use this, not `theme`, whenever you need to pick an actual color/style. */
    resolvedTheme: ResolvedTheme
    setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
    theme: "system",
    resolvedTheme: "light",
    setTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

function getSystemTheme(): ResolvedTheme {
    if (typeof window === "undefined") return "light"
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function ThemeProvider({
                                  children,
                                  defaultTheme = "system",
                                  storageKey = "theme",
                                  ...props
                              }: ThemeProviderProps) {
    const stored = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null
    const isValidTheme = (t: string | null): t is Theme => t === "light" || t === "dark" || t === "system"
    const [theme, setTheme] = React.useState<Theme>(
        isValidTheme(stored) ? stored : defaultTheme
    )
    const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>(() =>
        theme === "system" ? getSystemTheme() : theme
    )

    React.useEffect(() => {
        const root = window.document.documentElement

        function applyTheme() {
            const next: ResolvedTheme = theme === "system" ? getSystemTheme() : theme
            root.classList.remove("light", "dark")
            root.classList.add(next)
            setResolvedTheme(next)
        }

        applyTheme()

        // If the user's setting is "system", keep resolvedTheme (and the
        // applied class) in sync if they change their OS theme without
        // reloading the page — the old version only recomputed on mount
        // or when `theme` itself changed via setTheme.
        if (theme === "system") {
            const media = window.matchMedia("(prefers-color-scheme: dark)")
            media.addEventListener("change", applyTheme)
            return () => media.removeEventListener("change", applyTheme)
        }
    }, [theme])

    const value = {
        theme,
        resolvedTheme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme)
            setTheme(theme)
        },
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = React.useContext(ThemeProviderContext)

    if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

    return context
}