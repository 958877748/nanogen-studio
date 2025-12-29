import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/'])

// Check if Clerk environment variables are set
const hasClerkEnv = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY

const middleware = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const session = await auth()
    // Clerk will automatically handle the redirect if not authenticated
  }
})

export default hasClerkEnv ? middleware : (req: Request) => req

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}