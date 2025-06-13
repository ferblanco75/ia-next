import sql from '../../../lib/db.js';

export async function POST() {
  try {
    // Crear tabla de usuarios si no existe
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    return Response.json({ 
      message: "Base de datos inicializada correctamente",
      success: true 
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return Response.json({ 
      error: "Error al inicializar la base de datos",
      details: error.message 
    }, { status: 500 });
  }
} 