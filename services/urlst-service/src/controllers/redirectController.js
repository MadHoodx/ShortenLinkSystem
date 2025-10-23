import { findByShortCode } from '../models/url-models.js';
import axios from 'axios';

export async function redirectTo(req, res) {
  const { code } = req.params;
  try {
    const row = await findByShortCode(code);
    if (!row) return res.status(404).send('Not found');

    // notify analytics-service 
    if (process.env.ANALYTICS_URL) {
      axios.post(process.env.ANALYTICS_URL, {
        event_type: 'redirect',
        short_code: code,
        payload: {
          ip_address: req.ip,
          user_agent: req.headers['user-agent'] || '',
        }
      }).catch((e) => console.error('Analytics error:', e.message));
    }

    return res.redirect(row.full_url);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
}
