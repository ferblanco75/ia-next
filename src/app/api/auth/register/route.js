import { createUser, getUserByEmail } from '../../../../lib/auth.js';

export async function POST(request) {
  try {
    const { email, password, username } = await request.json();
    
    if (!username || !email || !password) {
      return Response.json({ error: "Nombre de usuario, email y contraseña son requeridos" }, { status: 400 });
    }
    
    if (password.length < 6) {
      return Response.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return Response.json({ error: "El usuario ya existe" }, { status: 400 });
    }
    
    // Crear el usuario
    const user = await createUser(username, email, password);
    
    // No devolver la contraseña
    const { password: _, ...userWithoutPassword } = user;
    
    return Response.json({ 
      message: "Usuario creado exitosamente",
      user: userWithoutPassword 
    });
    
  } catch (error) {
    console.error('Error en registro:', error);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 