import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import catalogRoutes from './routes/catalog.js';
import gamesRoutes from './routes/games.js';


dotenv.config();
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());


app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);
app.use('/catalog', catalogRoutes);
app.use('/games', gamesRoutes);


export default app;