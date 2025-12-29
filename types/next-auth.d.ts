// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      universityId?: string
      snipeItUserId?: number | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    universityId?: string
    snipeItUserId?: number | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string
    universityId?: string
    snipeItUserId?: number | null
  }
}
