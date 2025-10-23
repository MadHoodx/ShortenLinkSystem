import { insertEvent, getClickStats, getEventsByShortCode } from '../models/event-model.js';

export async function receiveEvent(req, res) {
  const { event_type, short_code, payload } = req.body || {};
  if (!event_type) return res.status(400).json({ error: 'event_type required' });
  try {
    const id = await insertEvent(event_type, short_code || null, payload || null);
    return res.status(201).json({ id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

export async function getStats(req, res) {
  const { short_code } = req.params;
  if (!short_code) return res.status(400).json({ error: 'short_code required' });
  try {
    const stats = await getClickStats(short_code);
    return res.json({ short_code, click_count: stats.click_count || 0 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

export async function getEvents(req, res) {
  const { short_code } = req.params;
  if (!short_code) return res.status(400).json({ error: 'short_code required' });
  try {
    const events = await getEventsByShortCode(short_code);
    return res.json(events);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
