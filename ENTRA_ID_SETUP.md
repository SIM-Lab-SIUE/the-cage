# Microsoft Entra ID (SAML) Setup Guide

This document explains how to migrate from development credentials to production Microsoft Entra ID authentication.

## Current State (Development)

The application currently uses a simple credentials provider for testing:
- **Provider:** NextAuth Credentials (username/password)
- **Email validation:** Must end with `@siue.edu`
- **Role assignment:** Hardcoded admin list vs. students
- **No password validation:** Any password works (dev only!)

## Production Setup Steps

### 1. Register Application in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Microsoft Entra ID** → **App registrations** → **New registration**
3. Configure:
   - **Name:** Equipment Checkout System (or your preferred name)
   - **Supported account types:** Accounts in this organizational directory only (SIUE)
   - **Redirect URI:** Web → `https://your-production-domain.com/api/auth/callback/microsoft-entra-id`

4. After creation, note down:
   - **Application (client) ID**
   - **Directory (tenant) ID**

### 2. Create Client Secret

1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Add description: "NextAuth Production"
4. Set expiration (recommend 24 months)
5. Copy the **Value** immediately (you won't see it again)

### 3. Configure API Permissions

1. Go to **API permissions** → **Add a permission**
2. Select **Microsoft Graph**
3. Add these delegated permissions:
   - `openid`
   - `profile`
   - `email`
   - `User.Read`
4. Click **Grant admin consent for [Your Org]**

### 4. Update Environment Variables

Add these to your production `.env` file:

```bash
# Microsoft Entra ID (Azure AD) Configuration
AUTH_MICROSOFT_ENTRA_ID_ID="<your-client-id>"
AUTH_MICROSOFT_ENTRA_ID_SECRET="<your-client-secret>"
AUTH_MICROSOFT_ENTRA_ID_ISSUER="https://login.microsoftonline.com/<your-tenant-id>/v2.0"

# Remove or set to 0 in production
# AUTH_DEV_CREDENTIALS="0"
```

### 5. Enable Entra ID Provider in Code

In `auth.config.ts`, uncomment the MicrosoftEntraID provider:

```typescript
// Change this:
// import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"

// To this:
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"

// Then uncomment the provider block:
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
  // Remove or comment out the Credentials provider
]
```

### 6. Update Login Page

The login page at `src/app/login/page.tsx` currently shows a username/password form. For Entra ID, you'll want to:

**Option A:** Replace form with "Sign in with Microsoft" button
```typescript
<button onClick={() => signIn('microsoft-entra-id', { callbackUrl: '/dashboard' })}>
  Sign in with Microsoft
</button>
```

**Option B:** Keep both options (useful for testing)
```typescript
<button onClick={() => signIn('microsoft-entra-id')}>Sign in with Microsoft</button>
<button onClick={() => signIn('credentials')}>Dev Login</button>
```

### 7. Handle Role Assignment

Currently, roles are hardcoded in the authorize function. With Entra ID, you have options:

**Option A: Keep hardcoded admin list** (simplest)
- Check user email from Entra ID profile
- Compare against admin list in jwt callback

**Option B: Use Azure AD Groups** (more scalable)
- Create "Equipment-Admins" group in Entra ID
- Add group claims to token
- Check group membership in jwt callback

Example for Option A (in `auth.config.ts` callbacks):

```typescript
async jwt({ token, profile }) {
  if (profile) {
    const email = profile.email?.toLowerCase() || ''
    const adminEmails = ['aleith@siue.edu', 'tpauli@siue.edu', 'bemoyer@siue.edu']
    token.role = adminEmails.includes(email) ? 'admin' : 'student'
  }
  return token
}
```

### 8. Test Before Full Rollout

1. Deploy to staging environment with Entra ID enabled
2. Test with both admin and student accounts
3. Verify:
   - Successful login redirect
   - Role assignment working
   - Session persistence
   - Logout flow
   - Error handling (denied access, etc.)

### 9. Migrate Users (if using Prisma adapter)

If you later add PrismaAdapter for user persistence:

```typescript
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const { handlers, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // ... rest of config
})
```

This will automatically create User records in your database on first sign-in.

### 10. Remove Development Credentials

Once Entra ID is working in production:

1. Remove the Credentials provider from `auth.config.ts`
2. Remove `AUTH_DEV_CREDENTIALS` environment variable
3. Update login page to only show "Sign in with Microsoft"
4. Archive `TEST_ACCOUNTS.md` (no longer needed)

## Troubleshooting

### "Redirect URI mismatch" error
- Ensure the redirect URI in Azure matches exactly: `https://your-domain.com/api/auth/callback/microsoft-entra-id`
- Check for http vs https
- No trailing slashes

### "Admin consent required" error
- Go back to API permissions in Azure
- Click "Grant admin consent"

### Users can't access after login
- Check if email domain validation is working
- Verify role assignment logic in jwt callback
- Check middleware.ts isn't blocking authenticated routes

### Session expires immediately
- Verify `AUTH_SECRET` is set in production
- Check `trustHost: true` in auth.ts for container deployments

## Architecture Notes

### Why JWT Sessions?

We use JWT strategy (`strategy: "jwt"`) instead of database sessions because:
- Simpler deployment (no session table needed)
- Works well with serverless/edge functions
- Sufficient for this application's scale
- Can add database adapter later if needed

### Role Storage

Roles are stored in the JWT token, not the database. This means:
- **Pros:** Fast, no database queries
- **Cons:** Role changes require re-login
- **Acceptable for:** Small admin list that rarely changes

If roles become more dynamic, consider:
1. Adding Role model to Prisma schema
2. Storing roles in database
3. Fetching role on each request (or caching)

## Security Considerations

1. **Client Secret Rotation:** Set calendar reminder to rotate secret before expiration
2. **Admin List:** Store admin emails in environment variable, not hardcoded
3. **HTTPS Only:** Ensure production uses HTTPS for all routes
4. **Session Duration:** Consider shorter session lifetime for admin users

## Support

For SIUE-specific Entra ID configuration questions, contact:
- ITS Help Desk: helpdesk@siue.edu
- Identity Management team

For NextAuth v5 documentation: https://authjs.dev/
