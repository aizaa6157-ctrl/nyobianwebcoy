import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip auth for activation API (public endpoint)
  if (request.nextUrl.pathname.startsWith('/api/activate')) {
    return NextResponse.next();
  }

  // Require auth for admin pages and license management APIs
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="KasirKu Admin"',
      },
    });
  }

  try {
    const auth = authHeader.split(' ')[1];
    const [username, password] = Buffer.from(auth, 'base64').toString().split(':');

    const validUsername = process.env.ADMIN_USERNAME || 'admin';
    const validPassword = process.env.ADMIN_PASSWORD || 'kasirku2026';

    if (username !== validUsername || password !== validPassword) {
      return new NextResponse('Invalid credentials', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="KasirKu Admin"',
        },
      });
    }

    return NextResponse.next();
  } catch (error) {
    return new NextResponse('Invalid authorization header', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="KasirKu Admin"',
      },
    });
  }
}

export const config = {
  matcher: [
    '/',
    '/api/licenses/:path*',
  ],
};
