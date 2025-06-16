import { getUserByEmail, verifyPassword, generateToken } from '../../../../lib/auth.js';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔍 Login attempt for email:', email);
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return Response.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
    }
    
    // Buscar el usuario
    console.log('🔍 Searching for user in database...');
    const user = await getUserByEmail(email);
    
    if (!user) {
      console.log('❌ User not found:', email);
      return Response.json({ error: "Credenciales inválidas" }, { status: 401 });
    }
    
    console.log('✅ User found:', { id: user.id, email: user.email });
    
    // Verificar la contraseña
    console.log('🔍 Verifying password...');
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', email);
      return Response.json({ error: "Credenciales inválidas" }, { status: 401 });
    }
    
    console.log('✅ Password verified successfully');
    
    // Generar token
    const token = generateToken(user.id);
    console.log('✅ Token generated for user:', user.id);
    
    // No devolver la contraseña
    const { password: _, ...userWithoutPassword } = user;
    
    return Response.json({ 
      message: "Login exitoso",
      user: userWithoutPassword,
      token 
    });
    
  } catch (error) {
    console.error('💥 Error in login:', error);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 