import express from 'express';
import { receiveEvent, getStats } from '../controllers/eventController.js';

const router = express.Router();

router.post('/', receiveEvent);

export default router;
