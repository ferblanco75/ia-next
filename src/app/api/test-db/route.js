import sql from '../../../lib/db.js';

export async function GET() {
  try {
    // Verificar conexión con una consulta simple
    const result = await sql`SELECT NOW() as current_time, version() as db_version;`;
    
    return Response.json({ 
      success: true,
      message: "Conexión exitosa a la base de datos",
      data: {
        currentTime: result.rows[0].current_time,
        dbVersion: result.rows[0].db_version
      }
    });
  } catch (error) {
    console.error('Error testing database connection:', error);
    return Response.json({ 
      success: false,
      error: "Error de conexión a la base de datos",
      details: error.message 
    }, { status: 500 });
  }
} 