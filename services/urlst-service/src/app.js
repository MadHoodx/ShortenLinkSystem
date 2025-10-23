import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import urlRoutes from './routes/url-routes.js';
import redirectRoutes from './routes/redirect.routes.js';
import authRoutes from './routes/auth-routes.js';
import { authMiddleware } from './middleware/auth.js';

dotenv.config();
const app = express();

app.set('trust proxy', true);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json());

// auth middleware (sets req.user when Authorization header present)
app.use(authMiddleware);


app.get('/health', (req, res) => {
	res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api', urlRoutes);
app.use('/api/auth', authRoutes);
app.use('/', redirectRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`URL Service listening on ${PORT}`));

export default app;
