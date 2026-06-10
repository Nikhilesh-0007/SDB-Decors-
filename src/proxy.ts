import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const session = request.cookies.get('sgb_admin_session')?.value;
  const isAuthenticated = session === 'authenticated_admin_session_active';

  const isAccessingAdmin = request.nextUrl.pathname.startsWith('/admin');
  const isAccessingLogin = request.nextUrl.pathname === '/admin/login';

  if (isAccessingAdmin) {
    // Redirect to login if not authenticated
    if (!isAuthenticated && !isAccessingLogin) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    // Redirect to admin index if already authenticated
    if (isAuthenticated && isAccessingLogin) {
      const dashboardUrl = new URL('/admin', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any image assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
