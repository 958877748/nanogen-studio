import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware(async (auth, req) => {
  const authResult = await auth()
  const headers = req.headers
  console.log('=== Middleware Debug ===')
  console.log('Authorization header:', headers.get('authorization'))
  console.log('Auth result:', JSON.stringify({
    tokenType: authResult.tokenType,
    sessionClaims: authResult.sessionClaims,
    sessionId: authResult.sessionId,
    userId: authResult.userId,
    isAuthenticated: authResult.isAuthenticated
  }, null, 2))
  console.log('=======================')
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}