import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Rutas de autenticación (no accesibles si ya estás logueado)
  const authRoutes = ['/login', '/register'];
  
  // El middleware no puede acceder a localStorage, así que solo protegemos rutas de auth
  // La autenticación se maneja en el cliente (páginas)
  
  // Si está en una ruta de auth, permitir acceso (la lógica de redirección está en las páginas)
  if (authRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Para otras rutas, permitir acceso (la autenticación se maneja en el cliente)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 