import { createUser, findUserByEmail } from '../models/user-model.js';
import { mergeDeviceToOwner } from '../models/url-models.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function register(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    console.warn('register: missing email or password', { body: req.body });
    return res.status(400).json({ error: 'email and password required' });
  }
  // email format check
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) return res.status(400).json({ error: 'invalid email format' });
  // password rules: min 8, max 20, must contain letter and number
  if (typeof password !== 'string' || password.length < 8 || password.length > 20) {
    return res.status(400).json({ error: 'password must be 8-20 characters' });
  }
  const pwdRe = /(?=.*[A-Za-z])(?=.*\d)/;
  if (!pwdRe.test(password)) return res.status(400).json({ error: 'password must include letters and numbers' });
  try {
    const existing = await findUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'email exists' });
    const id = await createUser(email, password);
    
    // Merge device history to new user account
    const device_id = req.cookies?.device_id;
    if (device_id) {
      const merged = await mergeDeviceToOwner(device_id, id);
      console.log(`Merged ${merged} URLs from device ${device_id} to user ${id}`);
      // Clear device_id cookie after merge
      res.clearCookie('device_id');
    }
    
    return res.status(201).json({ id, email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    console.warn('login: missing email or password', { body: req.body });
    return res.status(400).json({ error: 'email and password required' });
  }
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) return res.status(400).json({ error: 'invalid email format' });
  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'invalid credentials' });

    // Merge device history to user account
    const device_id = req.cookies?.device_id;
    if (device_id) {
      const merged = await mergeDeviceToOwner(device_id, user.id);
      console.log(`Merged ${merged} URLs from device ${device_id} to user ${user.id}`);
      // Clear device_id cookie after merge
      res.clearCookie('device_id');
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
