import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

export async function createUser(email, password) {
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hash]);
  return result.insertId;
}

export async function findUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

export async function findUserById(id) {
  const [rows] = await pool.query('SELECT id, email, created_at FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}
