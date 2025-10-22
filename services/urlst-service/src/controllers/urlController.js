import { insertUrl, listHistory } from '../models/url-models.js';
import QRCode from 'qrcode';
import { generateCode } from '../utils/generateCode.js';
import pool from '../config/db.js';

// Create a short URL
export async function shorten(req, res) {
  const { full_url } = req.body;
  if (!full_url) return res.status(400).json({ error: 'full_url is required' });

  try {
    // generate unique code 
    let short_code;
    while (true) {
      short_code = generateCode(6);
      const [rows] = await pool.query('SELECT id FROM urls WHERE short_code = ?', [short_code]);
      if (rows.length === 0) break; // unique
    }

    const id = await insertUrl(full_url, short_code);
    const short_url = `${process.env.BASE_URL}/${short_code}`;
    const qr_code = await QRCode.toDataURL(short_url);

    return res.json({ id, full_url, short_url, qr_code });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

export async function history(req, res) {
  try {
    const rows = await listHistory();
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
