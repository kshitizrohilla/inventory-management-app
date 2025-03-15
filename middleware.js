import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const publicRoutes = ['/', '/login', '/register'];
  const token = req.cookies.get('token')?.value;

  if (publicRoutes.includes(pathname) && token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return NextResponse.redirect(new URL('/dashboard', req.url));
    } catch (error) {
      return NextResponse.next();
    }
  }

  if (!publicRoutes.includes(pathname) && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};