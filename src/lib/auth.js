import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import sql from './db.js';

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

export async function createUser(username, email, password, faceData) {
  const hashedPassword = await hashPassword(password);
  let encryptedFaceData = null;
  if (typeof faceData === 'string' && faceData.length > 0) {
    encryptedFaceData = await bcrypt.hash(faceData, 10);
  }
  const safeUsername = typeof username === 'string' && username.length > 0 ? username : null;
  console.log('DEBUG createUser:', { email, hashedPassword, encryptedFaceData, safeUsername });

  try {
    const result = await sql`
      INSERT INTO users (email, password, face_data, username)
      VALUES (${email}, ${hashedPassword}, ${encryptedFaceData}, ${safeUsername})
      RETURNING id, email, created_at;
    `;
    return {
      id: result.rows[0].id.toString(),
      username: safeUsername,
      email: result.rows[0].email,
      createdAt: result.rows[0].created_at
    };
  } catch (error) {
    if (error.code === '23505') {
      throw new Error('El usuario ya existe');
    }
    throw error;
  }
}

export async function getUserByEmail(email) {
  try {
    const result = await sql`
      SELECT id, email, password, face_data, created_at
      FROM users
      WHERE email = ${email};
    `;
    if (result.rows.length === 0) {
      return null;
    }
    const user = result.rows[0];
    return {
      id: user.id.toString(),
      username: null,
      email: user.email,
      password: user.password,
      faceData: user.face_data,
      createdAt: user.created_at
    };
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

export async function getUserById(userId) {
  try {
    const result = await sql`
      SELECT id, email, password, created_at
      FROM users
      WHERE id = ${parseInt(userId)};
    `;
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    return {
      id: user.id.toString(),
      email: user.email,
      password: user.password,
      createdAt: user.created_at
    };
  } catch (error) {
    console.error('Error getting user by id:', error);
    return null;
  }
}

export async function getAllUsers() {
  try {
    const result = await sql`
      SELECT id, email, created_at
      FROM users
      ORDER BY created_at DESC;
    `;
    
    return result.rows.map(user => ({
      id: user.id.toString(),
      email: user.email,
      createdAt: user.created_at
    }));
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}

export async function updateUserFaceData(userId, faceData) {
  const encryptedFaceData = await bcrypt.hash(faceData, 10);
  try {
    const result = await sql`
      UPDATE users
      SET face_data = ${encryptedFaceData}
      WHERE id = ${parseInt(userId)}
      RETURNING id, username, email, face_data, created_at;
    `;
    if (result.rows.length === 0) {
      return null;
    }
    const user = result.rows[0];
    return {
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      faceData: user.face_data,
      createdAt: user.created_at
    };
  } catch (error) {
    console.error('Error updating face data:', error);
    return null;
  }
}

export async function verifyFaceLogin(email, inputFaceData) {
  const user = await getUserByEmail(email);
  if (!user || !user.faceData) return false;
  // Compara el input con el hash guardado
  const match = await bcrypt.compare(inputFaceData, user.faceData);
  return match ? user : false;
} 