// auth.ts
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

/**
 * Main NextAuth v5 configuration
 * Uses JWT sessions (no database adapter needed for credentials auth)
 * 
 * PRODUCTION TODO: When enabling Entra ID, consider adding:
 * - PrismaAdapter for user persistence
 * - University ID extraction from SAML profile
 * - SnipeIT user ID lookup/creation
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
  },
  trustHost: true,  // Trust localhost and container network hosts
})
