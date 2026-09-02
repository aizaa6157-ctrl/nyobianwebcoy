/**
 * Simple Basic Authentication
 * Uses environment variables for credentials
 */

export function checkAuth(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return false;
  }

  const auth = authHeader.split(' ')[1];
  const [username, password] = Buffer.from(auth, 'base64').toString().split(':');

  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'kasirku2026';

  return username === validUsername && password === validPassword;
}

export function requireAuth(request: Request): Response | null {
  if (!checkAuth(request)) {
    return new Response('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Dashboard"',
      },
    });
  }
  return null;
}
