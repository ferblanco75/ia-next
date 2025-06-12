import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Rutas que requieren autenticación
  const protectedRoutes = ['/'];
  
  // Rutas de autenticación (no accesibles si ya estás logueado)
  const authRoutes = ['/login', '/register'];
  
  // Verificar si el usuario está autenticado
  const token = request.cookies.get('token')?.value;
  
  // Si está en una ruta protegida y no tiene token, redirigir al login
  if (protectedRoutes.includes(pathname) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Si está en una ruta de auth y tiene token, redirigir al dashboard
  if (authRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 