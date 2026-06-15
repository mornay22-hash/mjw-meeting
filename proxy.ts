import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  if (path.startsWith('/login') || path.startsWith('/api/auth') || path.startsWith('/auth/callback')) {
    return NextResponse.next()
  }

  // Check for Supabase session cookie
  const hasSession = request.cookies.getAll().some(c => c.name.startsWith('sb-'))

  if (!hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

export default proxy
