import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import urlRoutes from './routes/url-routes.js';
import redirectRoutes from './routes/redirect.routes.js';

dotenv.config();
const app = express();

app.set('trust proxy', true);
app.use(cors());
app.use(express.json());

app.use('/api', urlRoutes);
app.use('/', redirectRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`URL Service listening on ${PORT}`));

export default app;
