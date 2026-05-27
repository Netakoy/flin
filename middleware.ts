import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const USER_COOKIE = 'flin_user_id';

export function middleware(request: NextRequest) {
  const userId = request.cookies.get(USER_COOKIE)?.value;
  const isSelectUserPage = request.nextUrl.pathname.startsWith('/select-user');

  if (!userId && !isSelectUserPage) {
    return NextResponse.redirect(new URL('/select-user', request.url));
  }

  if (userId && isSelectUserPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
