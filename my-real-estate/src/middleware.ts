import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const themeParam = req.nextUrl.searchParams.get('theme')
  if (themeParam) {
    const url = req.nextUrl.clone()
    url.searchParams.delete('theme')
    const res = NextResponse.redirect(url)
    res.cookies.set('site-theme', themeParam, { path: '/', maxAge: 60 * 60 * 24 * 365 })
    return res
  }
}

export const config = {
  matcher: ['/((?!_next/|api/|favicon.ico).*)'],
}
