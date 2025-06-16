import { getAllUsers, getUserByEmail } from '../../../../lib/auth.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (email) {
      // Buscar usuario específico
      const user = await getUserByEmail(email);
      if (user) {
        return Response.json({ 
          found: true,
          user: {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
            hasPassword: !!user.password,
            passwordLength: user.password ? user.password.length : 0
          }
        });
      } else {
        return Response.json({ 
          found: false,
          message: `Usuario con email ${email} no encontrado`
        });
      }
    } else {
      // Listar todos los usuarios
      const users = await getAllUsers();
      return Response.json({ 
        total: users.length,
        users: users.map(user => ({
          id: user.id,
          email: user.email,
          createdAt: user.createdAt
        }))
      });
    }
  } catch (error) {
    console.error('Error in debug API:', error);
    return Response.json({ 
      error: "Error interno del servidor",
      details: error.message 
    }, { status: 500 });
  }
} 