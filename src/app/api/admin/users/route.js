import { getAllUsers } from '../../../../lib/auth.js';

export async function GET() {
  try {
    const users = await getAllUsers();
    
    return Response.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 