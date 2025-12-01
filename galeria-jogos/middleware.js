import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_PATHS = [
  /^\/$/, // home
  /^\/grupos\/[^/]+\/?$/i, // detalhes do grupo
  /^\/api\/grupos(\/.*)?$/i, // APIs de grupos (para listar detalhes)
  /^\/api\/auth(\/.*)?$/i, // NextAuth
  /^\/_next\/.*/i, // assets Next.js
  /^\/favicon\.ico$/i,
  /^\/auth\/signin$/i,
  /^\/auth\/error$/i,
  /^\/imagens\/.*/i,
  /^\/public\/.*/i,
];

const isPublicPath = (pathname = '') => PUBLIC_PATHS.some((regex) => regex.test(pathname));

export async function middleware(req) {
  const { pathname, origin, search } = req.nextUrl;

  // libera caminhos publicos e assets
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token) {
    return NextResponse.next();
  }

  const callbackUrl = pathname + (search || '');
  const signinUrl = new URL('/auth/signin', origin);
  signinUrl.searchParams.set('callbackUrl', callbackUrl || '/');
  return NextResponse.redirect(signinUrl);
}

// Aplica o middleware em todas as rotas (excecoes tratadas em isPublicPath)
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
