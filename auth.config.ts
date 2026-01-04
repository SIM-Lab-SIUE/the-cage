// auth.config.ts
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
// import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"

/**
 * Auth configuration for NextAuth v5
 * Edge-compatible for use in middleware
 * 
 * PRODUCTION TODO: Uncomment MicrosoftEntraID import and provider below
 * when ready to enable SAML authentication via Microsoft Entra ID
 */
export const authConfig = {
  providers: [
    // PRODUCTION: Uncomment this block when Entra ID credentials are configured
    // MicrosoftEntraID({
    //   clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
    //   clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
    //   issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
    //   authorization: {
    //     params: {
    //       scope: "openid profile email User.Read",
    //     },
    //   },
    // }),
    
    // DEV: Simple credentials provider for development/testing
    // Remove or disable this when Entra ID is active
    Credentials({
      id: "credentials",
      name: "SIUE Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "username@siue.edu" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = (credentials?.email || "").toString().toLowerCase().trim()
        
        // Validate SIUE email domain
        if (!email.endsWith('@siue.edu')) {
          return null
        }
        
        // Determine role based on admin list
        const adminEmails = ['aleith@siue.edu', 'tpauli@siue.edu', 'bemoyer@siue.edu']
        const role = adminEmails.includes(email) ? 'admin' : 'student'
        const name = email.split("@")[0]
        
        return {
          id: email,
          email,
          name,
          role,
        } as any
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Pass role from user object to token
      if (user && (user as any).role) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      // Pass role from token to session
      if (session.user && token.role) {
        (session.user as any).role = token.role
      }
      return session
    },
  },
} satisfies NextAuthConfig
