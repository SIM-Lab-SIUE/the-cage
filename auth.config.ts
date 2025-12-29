// auth.config.ts
import type { NextAuthConfig } from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import Credentials from "next-auth/providers/credentials"

/**
 * Auth configuration for NextAuth v5
 * This file is edge-compatible and can be used in middleware
 */
export const authConfig = {
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
      },
    }),
    // Optional dev-only credentials provider for UAT
    ...(process.env.AUTH_DEV_CREDENTIALS === "1"
      ? [
          Credentials({
            id: "credentials",
            name: "Dev Credentials",
            credentials: {
              email: { label: "Email", type: "text" },
              password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
              const email = (credentials?.email || "").toString().toLowerCase().trim()
              const name = email.split("@")[0] || "Test User"
              if (!email) return null
              // Allow any password in dev; simple role heuristic
              const isStaff = email.endsWith("@siue.edu") && email.startsWith("staff")
              return {
                id: `dev-${email}`,
                email,
                name,
                role: isStaff ? "staff" : "student",
              } as any
            },
          }),
        ]
      : []),
  ],
  pages: process.env.AUTH_DEV_CREDENTIALS === "1"
    ? undefined
    : {
        signIn: '/login',
        error: '/login',
      },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnLoginPage = nextUrl.pathname === '/login'
      
      if (isOnLoginPage) {
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl))
        return true
      }
      
      return isLoggedIn
    },
  },
} satisfies NextAuthConfig
