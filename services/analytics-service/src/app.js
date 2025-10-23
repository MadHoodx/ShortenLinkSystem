import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import eventsRoutes from './routes/events-routes.js';
import { getStats, getEvents } from './controllers/eventController.js';

dotenv.config();
const app = express();
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(bodyParser.json());

app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.get('/stats/:short_code', getStats);
app.get('/analytics/:short_code', getEvents);
app.use('/events', eventsRoutes);

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Analytics Service listening on ${PORT}`));

export default app;
