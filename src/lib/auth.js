import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro';

// Almacenamiento temporal en memoria (solo para desarrollo)
let users = new Map();

export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function createUser(email, password) {
  const hashedPassword = await hashPassword(password);
  const user = {
    id: Date.now().toString(),
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };
  
  // Almacenar en memoria temporal
  users.set(email, user);
  return user;
}

export async function getUserByEmail(email) {
  return users.get(email) || null;
}

export async function getUserById(userId) {
  for (const [email, user] of users.entries()) {
    if (user.id === userId) {
      return user;
    }
  }
  return null;
} 