import express from 'express';
import { shorten, history, remove, update } from '../controllers/urlController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// POST 
router.post('/shorten', shorten);

// GET 
router.get('/history', history);

// PATCH (requires authentication)
router.patch('/urls/:id', verifyToken, update);

// DELETE (requires authentication)
router.delete('/urls/:id', verifyToken, remove);

export default router;

