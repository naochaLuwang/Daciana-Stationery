import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Do not remove getUser(). This refreshes the session if it's expired.
    // 1. Get user session
    const { data: { user } } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname;

    // 2. Define routes that REQUIRE authentication
    const isProtectedRoute =
        path.startsWith('/checkout') ||
        path.startsWith('/profile') ||
        path.startsWith('/wishlist');

    // 3. Define Admin Routes (Only admins can see these)
    const isAdminRoute = path.startsWith('/admin');

    // REDIRECT LOGIC:

    // If no user and trying to access a protected route, redirect to login
    if (!user && isProtectedRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirect', path)
        return NextResponse.redirect(url)
    }

    // If user is logged in but trying to access /admin, we let the 
    // AdminLayout handle the specific is_admin check for better UX.
    // Or you can add a quick check here if you have the user's metadata.

    return supabaseResponse
}