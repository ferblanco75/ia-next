import { getUserByEmail } from '../../../../lib/auth.js';

// Función temporal para obtener todos los usuarios
async function getAllUsers() {
  // Como estamos usando almacenamiento en memoria, necesitamos una forma de obtener todos
  // En una implementación real, esto sería una consulta a la base de datos
  const users = [];
  
  // Por ahora, retornamos un array vacío
  // En una implementación con base de datos real, aquí harías:
  // const users = await db.query('SELECT id, email, createdAt FROM users');
  
  return users;
}

export async function GET() {
  try {
    const users = await getAllUsers();
    
    // No devolver contraseñas
    const safeUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt
    }));
    
    return Response.json({ users: safeUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 