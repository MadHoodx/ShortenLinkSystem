import express from 'express';
import { shorten, history } from '../controllers/urlController.js';

const router = express.Router();

// POST 
router.post('/shorten', shorten);

// GET 
router.get('/history', history);

export default router;

