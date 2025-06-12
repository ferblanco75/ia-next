import { getUserByEmail, verifyPassword, generateToken } from '../../../../lib/auth.js';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return Response.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
    }
    
    // Buscar el usuario
    const user = await getUserByEmail(email);
    if (!user) {
      return Response.json({ error: "Credenciales inválidas" }, { status: 401 });
    }
    
    // Verificar la contraseña
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return Response.json({ error: "Credenciales inválidas" }, { status: 401 });
    }
    
    // Generar token
    const token = generateToken(user.id);
    
    // No devolver la contraseña
    const { password: _, ...userWithoutPassword } = user;
    
    return Response.json({ 
      message: "Login exitoso",
      user: userWithoutPassword,
      token 
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 