import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Pool } from 'pg';

dotenv.config();

// Configuración de la base de datos Neon PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Verificar conexión a la base de datos
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error conectando a PostgreSQL:', err);
  } else {
    console.log('✅ Conectado a Neon PostgreSQL:', res.rows[0]);
  }
});

const app = express();

// Configurar CORS para permitir peticiones desde el frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ===== FUNCIONES DE BASE DE DATOS =====

// Crear tabla de usuarios si no existe
async function createUsersTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        face_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(query);
    console.log('✅ Tabla users creada/verificada');
  } catch (error) {
    console.error('❌ Error creando tabla users:', error);
  }
}

// Buscar usuario por email
async function findUserByEmail(email) {
  try {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error buscando usuario:', error);
    return null;
  }
}

// Crear nuevo usuario
async function createUser(userData) {
  try {
    const query = `
      INSERT INTO users (username, email, password_hash, face_data)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, created_at
    `;
    const values = [userData.username, userData.email, userData.password_hash, userData.face_data];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    throw error;
  }
}

// Actualizar datos faciales del usuario
async function updateUserFaceData(userId, faceData) {
  try {
    const query = `
      UPDATE users 
      SET face_data = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, username, email
    `;
    const result = await pool.query(query, [faceData, userId]);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error actualizando datos faciales:', error);
    throw error;
  }
}

// Inicializar tabla al arrancar
createUsersTable();

// Base de datos simulada de usuarios (mantener como respaldo temporal)
let users = [
  {
    id: 1,
    username: "admin",
    email: "admin@example.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "password"
    faceData: null, // Aquí se almacenaría el hash de los datos faciales
    createdAt: new Date()
  }
];

// Función para generar JWT
function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'tu-secreto-super-seguro',
    { expiresIn: '24h' }
  );
}

// Middleware para verificar JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'tu-secreto-super-seguro', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
}

// Función para usar Google Gemini (gratuito, funciona en Vercel)
async function chatWithGemini(prompt) {
  try {
    console.log("🤖 Intentando usar Google Gemini...");
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent(prompt);
    console.log("✅ Respuesta generada con Google Gemini");
    return result.response.text();
  } catch (error) {
    console.error('❌ Error con Gemini:', error);
    throw new Error('Error al conectar con Google Gemini. Verifica tu API key.');
  }
}

// Función para usar Hugging Face (gratuito, funciona en Vercel)
async function chatWithHuggingFace(prompt) {
  try {
    console.log("🤖 Intentando usar Hugging Face...");
    const { HfInference } = await import('@huggingface/inference');
    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    
    const response = await hf.textGeneration({
      model: 'microsoft/DialoGPT-medium',
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.7
      }
    });
    console.log("✅ Respuesta generada con Hugging Face");
    return response.generated_text;
  } catch (error) {
    console.error('❌ Error con Hugging Face:', error);
    throw new Error('Error al conectar con Hugging Face. Verifica tu API key.');
  }
}

// Función para usar OpenAI (mantener como respaldo)
async function chatWithOpenAI(prompt) {
  try {
    console.log("🤖 Usando OpenAI como respaldo...");
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });
    console.log("✅ Respuesta generada con OpenAI");
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('❌ Error con OpenAI:', error);
    throw new Error('Error al conectar con OpenAI.');
  }
}

app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  try {
    console.log("🔍 Verificando servicios de IA disponibles...");
    console.log("GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY ? "✅ Configurada" : "❌ No configurada");
    console.log("HUGGINGFACE_API_KEY:", process.env.HUGGINGFACE_API_KEY ? "✅ Configurada" : "❌ No configurada");
    console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✅ Configurada" : "❌ No configurada");

    let response;
    
    // Intentar usar Google Gemini primero (gratuito, funciona en Vercel)
    if (process.env.GOOGLE_API_KEY) {
      try {
        response = await chatWithGemini(prompt);
      } catch (geminiError) {
        console.log('❌ Gemini no disponible:', geminiError.message);
      }
    }
    
    // Si Gemini falla, intentar Hugging Face
    if (!response && process.env.HUGGINGFACE_API_KEY) {
      try {
        response = await chatWithHuggingFace(prompt);
      } catch (hfError) {
        console.log('❌ Hugging Face no disponible:', hfError.message);
      }
    }
    
    // Si ambos fallan, usar OpenAI como respaldo
    if (!response && process.env.OPENAI_API_KEY) {
      try {
        response = await chatWithOpenAI(prompt);
      } catch (openaiError) {
        console.log('❌ OpenAI no disponible:', openaiError.message);
      }
    }
    
    if (!response) {
      console.log("💥 No se pudo conectar con ningún servicio de IA");
      return res.status(500).json({ 
        error: "No se pudo conectar con ningún servicio de IA. Configura al menos una API key (GOOGLE_API_KEY, HUGGINGFACE_API_KEY, o OPENAI_API_KEY)." 
      });
    }

    res.json({ response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating response" });
  }
});

// ===== RUTAS DE AUTENTICACIÓN =====

// Registro de usuario
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password, faceData } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    if (faceData && faceData.length < 10) {
      return res.status(400).json({ error: "Los datos faciales parecen inválidos" });
    }

    // Verificar si el usuario ya existe
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log("Registrando usuario:", { username, email, faceData });
    
    let encryptedFaceData = null;
    if (faceData) {
      encryptedFaceData = await bcrypt.hash(faceData, 10);
    }
    
    // Crear nuevo usuario
    const newUser = {
      username,
      email,
      password_hash: hashedPassword,
      face_data: encryptedFaceData,
      created_at: new Date()
    };

    const createdUser = await createUser(newUser);
    
    // Generar token
    const token = generateToken(createdUser);
    
    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      user: {
        id: createdUser.id,
        username: createdUser.username,
        email: createdUser.email
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Login tradicional
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son requeridos" });
    }

    // Buscar usuario
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Generar token
    const token = generateToken(user);
    
    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Login facial
app.post("/api/auth/face-login", async (req, res) => {
  try {
    const { faceData, email } = req.body;
    
    if (!faceData || !email) {
      return res.status(400).json({ error: "Datos faciales y email son requeridos" });
    }

    // Buscar usuario
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    // Verificar datos faciales (simulación - en producción usarías una librería de reconocimiento facial)
    if (!user.face_data) {
      return res.status(400).json({ error: "Usuario no tiene datos faciales registrados" });
    }

    // Simulación de verificación facial (en producción usarías face-api.js o similar)
    const faceMatch = await verifyFaceData(faceData, user.face_data);
    if (!faceMatch) {
      return res.status(401).json({ error: "Verificación facial fallida" });
    }

    // Generar token
    const token = generateToken(user);
    
    res.json({
      message: "Login facial exitoso",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error en login facial:', error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Función simulada para verificar datos faciales
async function verifyFaceData(inputFaceData, storedFaceData) {
  try {
    // En producción, aquí usarías una librería como face-api.js o similar
    // Por ahora, simulamos una verificación exitosa
    console.log('🔍 Verificando datos faciales...');
    
    // Simulación: comparar hashes de los datos faciales
    const inputHash = await bcrypt.hash(inputFaceData, 10);
    const storedHash = storedFaceData;
    
    // En una implementación real, aquí compararías vectores de características faciales
    // Por ahora, simulamos que siempre es exitoso
    const isMatch = true; // Simulación
    
    if (isMatch) {
      console.log('✅ Verificación facial exitosa');
      return true;
    } else {
      console.log('❌ Verificación facial fallida');
      return false;
    }
  } catch (error) {
    console.error('❌ Error en verificación facial:', error);
    return false;
  }
}

// Verificar token
app.post("/api/auth/verify", authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: req.user 
  });
});

// Actualizar datos faciales del usuario
app.post("/api/auth/update-face", authenticateToken, async (req, res) => {
  try {
    const { faceData } = req.body;
    const userId = req.user.userId;

    if (!faceData) {
      return res.status(400).json({ error: "Datos faciales requeridos" });
    }

    // Encriptar datos faciales antes de guardar
    const encryptedFaceData = await bcrypt.hash(faceData, 10);
    
    // Actualizar en la base de datos
    const updatedUser = await updateUserFaceData(userId, encryptedFaceData);
    
    res.json({
      message: "Datos faciales actualizados exitosamente",
      user: updatedUser
    });
  } catch (error) {
    console.error('Error actualizando datos faciales:', error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta protegida de ejemplo
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({ 
    message: "Ruta protegida accedida exitosamente",
    user: req.user 
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Servidor iniciado en http://localhost:${PORT}`);
}); 