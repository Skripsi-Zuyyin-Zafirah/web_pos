import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  // Do not run on static files
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('/api/') ||
    request.nextUrl.pathname.includes('/static') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return supabaseResponse
  }

  // 1. Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthPage = pathname.startsWith('/auth')
  const isAdminPage = pathname.startsWith('/admin')
  const isCashierPage = pathname.startsWith('/cashier')
  const isProfilePage = pathname.startsWith('/profile')
  const isTransactionsPage = pathname.startsWith('/transactions')

  // 2. Early exit for public pages if not trying to access auth pages
  if (!user && !isAdminPage && !isCashierPage && !isProfilePage && !isTransactionsPage) {
    return supabaseResponse
  }

  // 3. If NOT logged in and trying to access private pages, redirect to login
  if (!user && (isAdminPage || isCashierPage || isProfilePage || isTransactionsPage)) {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // 4. If logged in, we might need role-based checks or redirects
  if (user) {
    // Only fetch profile if we are on an auth page (for redirection) 
    // or a restricted page (for authorization)
    if (isAuthPage || isAdminPage || isCashierPage) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (isAuthPage) {
        if (profile?.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url))
        } else if (profile?.role === 'cashier') {
          return NextResponse.redirect(new URL('/cashier/pos', request.url))
        } else {
          return NextResponse.redirect(new URL('/menu', request.url))
        }
      }

      if (isAdminPage && profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }

      if (isCashierPage && profile?.role !== 'cashier' && profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
