// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//   const session = request.cookies.get('session');
//   const isLogin = request.nextUrl.pathname === '/login';
//   // Si no hay sesión y no está en login, redirige
//   if (!session && !isLogin) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }
//   // Si está logueado y entra a /login, redirige al inicio
//   if (session && isLogin) {
//     return NextResponse.redirect(new URL('/', request.url));
//   }
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/((?!_next|api|static|favicon.ico).*)'],
// };
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 🔹 Definir rutas protegidas
  const protectedRoutes: string[] = ["/dashboard", "/settings"];

  // 🔹 Redirigir al login si no hay token y la ruta es protegida
  if (
    !token &&
    protectedRoutes.some((path) => req.nextUrl.pathname.startsWith(path))
  ) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const res = NextResponse.next();

  // 🔥 Habilitar CORS solo en las API (/api/*)
  if (req.nextUrl.pathname.startsWith("/api")) {
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  return res;
}

// 🔹 Aplica el middleware solo en rutas de API y protegidas
export const config = {
  matcher: ["/api/:path*", "/dashboard", "/settings"], // Agrega más rutas si es necesario
};
