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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Route categories
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')
  const isCashierPage = request.nextUrl.pathname.startsWith('/cashier')
  const isPublicPage = ['/', '/menu', '/queue'].includes(request.nextUrl.pathname)

  // 1. If user is logged in and trying to access auth pages (login/register), redirect to their dashboard
  if (user && isAuthPage) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    } else if (profile?.role === 'cashier') {
      return NextResponse.redirect(new URL('/cashier/pos', request.url))
    } else {
      return NextResponse.redirect(new URL('/menu', request.url))
    }
  }

  // 2. If user is NOT logged in and trying to access private pages, redirect to login
  if (!user && (isAdminPage || isCashierPage)) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // 3. If user is logged in and trying to access restricted pages, check roles
  if (user && (isAdminPage || isCashierPage)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Redirect if no profile or wrong role
    if (isAdminPage && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (isCashierPage && profile?.role !== 'cashier' && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
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
