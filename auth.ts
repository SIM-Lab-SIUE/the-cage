// auth.ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import { authConfig } from "./auth.config"

const prisma = new PrismaClient()

/**
 * Main NextAuth v5 configuration with Prisma adapter and session expansion
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  trustHost: true,  // Trust localhost and container network hosts
  callbacks: {
    async jwt({ token, user, profile, account }) {
      // On initial sign in, extract University ID from Entra profile
      if (profile && account) {
        // Extract employee/student ID from Entra profile
        // The field name may vary - check your Entra ID setup
        const p = profile as Record<string, unknown>;
        const employeeId = typeof p.employeeId === 'string' ? p.employeeId : undefined;
        const extensionId = typeof p.extension_UniversityID === 'string' ? p.extension_UniversityID : undefined;
        const samAccount = typeof p.onPremisesSamAccountName === 'string' ? p.onPremisesSamAccountName : undefined;
        const preferredUsername = typeof p.preferred_username === 'string' ? p.preferred_username : undefined;
        
        token.universityId = employeeId || extensionId || samAccount || preferredUsername;
        token.snipeItUserId = null; // Will be populated from database lookup
      }
      
      if (user) {
        token.id = user.id
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.universityId = token.universityId as string
        session.user.snipeItUserId = token.snipeItUserId as number | null
      }
      
      return session
    },
  },
})
