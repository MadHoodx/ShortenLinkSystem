import express from 'express';
import { redirectTo } from '../controllers/redirectController.js';

const router = express.Router();

// GET /:code
router.get('/:code', redirectTo);

export default router;
