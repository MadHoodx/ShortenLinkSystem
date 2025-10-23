import pool from '../config/db.js';

export async function insertEvent(event_type, short_code, payload) {
  const [result] = await pool.query('INSERT INTO events (event_type, short_code, payload) VALUES (?, ?, ?)', [event_type, short_code, JSON.stringify(payload)]);
  return result.insertId;
}

export async function getClickStats(short_code) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as click_count FROM events WHERE short_code = ? AND event_type = ?',
    [short_code, 'redirect']
  );
  return rows[0];
}

export async function getEventsByShortCode(short_code) {
  const [rows] = await pool.query(
    'SELECT id, event_type, short_code, created_at FROM events WHERE short_code = ? AND event_type = ? ORDER BY created_at DESC',
    [short_code, 'redirect']
  );
  return rows;
}
