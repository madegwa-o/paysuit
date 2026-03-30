"use client"

import { useState, useEffect } from "react"

export interface SavedCredential {
    id: string
    name: string
    consumerKey: string
    consumerSecret: string
    shortCode?: string
    passkey?: string
    initiatorName?: string
    initiatorPassword?: string
    createdAt: string
}

const STORAGE_KEY = "paysuit_daraja_credentials"

export function useSavedCredentials() {
    const [credentials, setCredentials] = useState<SavedCredential[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    // Load credentials from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                setCredentials(JSON.parse(saved))
            }
        } catch (error) {
            console.error("Error loading saved credentials:", error)
        }
        setIsLoaded(true)
    }, [])

    // Save credentials to localStorage
    const saveCredential = (credential: Omit<SavedCredential, "id" | "createdAt">) => {
        const newCredential: SavedCredential = {
            ...credential,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        }

        const updated = [...credentials, newCredential]
        setCredentials(updated)

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } catch (error) {
            console.error("Error saving credentials:", error)
        }

        return newCredential
    }

    // Delete a credential
    const deleteCredential = (id: string) => {
        const updated = credentials.filter(c => c.id !== id)
        setCredentials(updated)

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } catch (error) {
            console.error("Error deleting credential:", error)
        }
    }

    // Get a credential by ID
    const getCredential = (id: string) => {
        return credentials.find(c => c.id === id)
    }

    // Update a credential
    const updateCredential = (id: string, updates: Partial<SavedCredential>) => {
        const updated = credentials.map(c =>
            c.id === id ? { ...c, ...updates } : c
        )
        setCredentials(updated)

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } catch (error) {
            console.error("Error updating credential:", error)
        }
    }

    return {
        credentials,
        isLoaded,
        saveCredential,
        deleteCredential,
        getCredential,
        updateCredential,
    }
}
