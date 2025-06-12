import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import kv from './kv.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro';

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
  
  await kv.set(`user:${email}`, user);
  return user;
}

export async function getUserByEmail(email) {
  return await kv.get(`user:${email}`);
}

export async function getUserById(userId) {
  const users = await kv.keys('user:*');
  for (const key of users) {
    const user = await kv.get(key);
    if (user.id === userId) {
      return user;
    }
  }
  return null;
} 