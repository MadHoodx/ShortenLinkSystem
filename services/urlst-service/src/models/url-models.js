import pool from '../config/db.js';

export async function findByShortCode(code) {
  const [rows] = await pool.query('SELECT * FROM urls WHERE short_code = ?', [code]);
  return rows[0] || null;
}

export async function insertUrl(full_url, short_code, owner_id = null, device_id = null) {
  const [result] = await pool.query(
    'INSERT INTO urls (full_url, short_code, owner_id, device_id) VALUES (?, ?, ?, ?)',
    [full_url, short_code, owner_id, device_id]
  );
  return result.insertId;
}

export async function listHistory() {
  const [rows] = await pool.query('SELECT * FROM urls ORDER BY created_at DESC');
  return rows;
}

export async function listHistoryByOwner(owner_id) {
  const [rows] = await pool.query('SELECT * FROM urls WHERE owner_id = ? ORDER BY created_at DESC', [owner_id]);
  return rows;
}

export async function listHistoryByDevice(device_id) {
  const [rows] = await pool.query('SELECT * FROM urls WHERE device_id = ? ORDER BY created_at DESC', [device_id]);
  return rows;
}

