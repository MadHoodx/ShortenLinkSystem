import pool from '../config/db.js';

export async function findByShortCode(code) {
  const [rows] = await pool.query('SELECT * FROM urls WHERE short_code = ?', [code]);
  return rows[0] || null;
}

export async function insertUrl(full_url, short_code) {
  const [result] = await pool.query('INSERT INTO urls (full_url, short_code) VALUES (?, ?)', [full_url, short_code]);
  return result.insertId;
}

export async function listHistory() {
  const [rows] = await pool.query('SELECT * FROM urls ORDER BY created_at DESC');
  return rows;
}
