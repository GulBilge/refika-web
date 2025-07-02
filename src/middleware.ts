import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/signup', '/favicon.ico']

export function middleware(req: NextRequest) {
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

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
