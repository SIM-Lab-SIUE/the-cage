// middleware.ts
import { auth } from "./auth"

/**
 * NextAuth v5 middleware to protect routes
 * Allows public access to login page and static assets
 */
export default auth((req) => {
  // req.auth contains the session object
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Public routes that don't require authentication
  const isPublicRoute = 
    pathname === '/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico'

  if (!isPublicRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return Response.redirect(loginUrl)
  }

  return undefined
})

/**
 * Matcher configuration - applies middleware to all routes except specified patterns
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
