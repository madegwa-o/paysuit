import NextAuth, { type DefaultSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { addOrUpdateUser, getUserByEmail } from "@/lib/users"
import { Role } from "@/models/User"

// Extend NextAuth types to include roles
declare module "next-auth" {
    interface Session {
        user: {
            id?: string | null
            roles?: string[]
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        roles?: string[]
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        userId?: string
        roles?: string[]
    }
}

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                try {
                    const user = await getUserByEmail(credentials.email)
                    if (!user || !user.password) {
                        return null
                    }

                    const isValid = await user.comparePassword(credentials.password)
                    if (!isValid) {
                        return null
                    }

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        roles: user.roles,
                    }
                } catch (error) {
                    console.error("Authorization error:", error)
                    return null
                }
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ user, account }) {
            try {
                if (account?.provider === "google" && user.email && user.name) {
                    await addOrUpdateUser({
                        name: user.name,
                        email: user.email,
                        image: user.image ?? undefined,
                        roles: [Role.USER],
                    })
                }
                return true
            } catch (error) {
                console.error("Sign in error:", error)
                return false
            }
        },
        async jwt({ token, user, trigger }) {
            if (user?.email || trigger === "update") {
                try {
                    const email = user?.email || token.email
                    if (email) {
                        const existingUser = await getUserByEmail(email)
                        if (existingUser) {
                            token.roles = existingUser.roles || [Role.USER]
                            token.userId = existingUser._id.toString()
                            token.name = existingUser.name
                            token.picture = existingUser.image
                        }
                    }
                } catch (error) {
                    console.error("JWT callback error:", error)
                }
            }
            return token
        },
        async session({ session, token }) {
            try {
                if (token?.userId) {
                    session.user.id = token.userId
                    session.user.roles = (token.roles as string[]) || [Role.USER]
                    session.user.name = token.name
                    session.user.image = token.picture
                }
                return session
            } catch (error) {
                console.error("Session callback error:", error)
                return session
            }
        },
    },
    pages: {
        signIn: "/signin",
        error: "/signin",
    },
    debug: process.env.NODE_ENV === "development",
})

export { handler as GET, handler as POST }
