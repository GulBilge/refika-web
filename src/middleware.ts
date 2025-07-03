import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {  createClient } from '@/utils/supabase/server'


const PUBLIC_PATHS = ['/login', '/signup', '/favicon.ico']

export async function middleware(req: NextRequest) {
  const supabase = await createClient()
  const { pathname } = req.nextUrl
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  // Doğru yerde: req.cookies
  const allCookies = req.cookies.getAll()

  const tokenCookie = allCookies.find(({ name }) =>
    /^sb-.*-auth-token$/.test(name)
  )

  if (!tokenCookie) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  // Admin route kontrolü
  const { data: { session } } = await supabase.auth.getSession();
  if (pathname.startsWith('/admin')) {
    const { data: userData } = await  supabase
      .from('users')
      .select('role')
      .eq('id', session?.user?.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard', '/profil','/((?!_next/static|_next/image|favicon.ico).*)'],
}
