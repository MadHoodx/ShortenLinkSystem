import pool from '../config/db.js';

export async function findByShortCode(code) {
  const [rows] = await pool.query('SELECT * FROM urls WHERE short_code = ?', [code]);
  return rows[0] || null;
}

export async function insertUrl(full_url, short_code, owner_id = null, device_id = null, title = null) {
  const [result] = await pool.query(
    'INSERT INTO urls (full_url, short_code, owner_id, device_id, title) VALUES (?, ?, ?, ?, ?)',
    [full_url, short_code, owner_id, device_id, title]
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

export async function mergeDeviceToOwner(device_id, owner_id) {
  // Move all URLs from device_id to owner_id
  const [result] = await pool.query(
    'UPDATE urls SET owner_id = ?, device_id = NULL WHERE device_id = ? AND owner_id IS NULL',
    [owner_id, device_id]
  );
  return result.affectedRows;
}

export async function deleteUrl(id, owner_id) {
  // Delete URL only if it belongs to the owner
  const [result] = await pool.query(
    'DELETE FROM urls WHERE id = ? AND owner_id = ?',
    [id, owner_id]
  );
  return result.affectedRows;
}

export async function updateTitle(id, owner_id, title) {
  // Update title only if URL belongs to the owner
  const [result] = await pool.query(
    'UPDATE urls SET title = ? WHERE id = ? AND owner_id = ?',
    [title, id, owner_id]
  );
  return result.affectedRows;
}
