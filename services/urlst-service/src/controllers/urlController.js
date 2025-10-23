import { insertUrl, listHistory, listHistoryByOwner, listHistoryByDevice, deleteUrl, updateTitle } from '../models/url-models.js';
import QRCode from 'qrcode';
import { generateCode } from '../utils/generateCode.js';
import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

// Create a short URL
export async function shorten(req, res) {
  const { full_url, title } = req.body;
  if (!full_url) return res.status(400).json({ error: 'full_url is required' });

  // validate URL format (require http or https)
  try {
    const parsed = new URL(full_url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'full_url must use http or https' });
    }
    if (full_url.length > 2000) return res.status(400).json({ error: 'full_url too long' });
  } catch (e) {
    return res.status(400).json({ error: 'invalid full_url format' });
  }

  try {
    // generate unique code 
    let short_code;
    while (true) {
      short_code = generateCode(6);
      const [rows] = await pool.query('SELECT id FROM urls WHERE short_code = ?', [short_code]);
      if (rows.length === 0) break; // unique
    }

    // owner_id from authenticated user (if any)
    const owner_id = req.user?.id || null;
    // device_id from cookie (if any)
    let device_id = req.cookies?.device_id || null;
    if (!owner_id && !device_id) {
      device_id = uuidv4();
      // set cookie so subsequent requests include it
      res.cookie('device_id', device_id, { httpOnly: false, sameSite: 'lax', maxAge: 31536000000 }); // 1 year
    }

    const id = await insertUrl(full_url, short_code, owner_id, device_id, title || null);
    const short_url = `${process.env.BASE_URL}/${short_code}`;
    const qr_code = await QRCode.toDataURL(short_url);

    return res.json({ id, full_url, short_url, qr_code, title });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

export async function history(req, res) {
  try {
    if (req.user && req.user.id) {
      const rows = await listHistoryByOwner(req.user.id);
      return res.json(rows);
    }

    const deviceId = req.cookies?.device_id;
    if (!deviceId) return res.json([]);
    const rows = await listHistoryByDevice(deviceId);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

export async function remove(req, res) {
  try {
    // Require authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'URL ID is required' });
    }

    const affectedRows = await deleteUrl(id, req.user.id);
    
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'URL not found or unauthorized' });
    }

    return res.json({ message: 'URL deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

export async function update(req, res) {
  try {
    // Require authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const { title } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'URL ID is required' });
    }

    // Allow empty string to clear title
    if (title === undefined) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const affectedRows = await updateTitle(id, req.user.id, title || null);
    
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'URL not found or unauthorized' });
    }

    return res.json({ message: 'Title updated successfully', title });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
