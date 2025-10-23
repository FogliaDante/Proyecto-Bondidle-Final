import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getUserHistory, getGlobalRanking, getUserStats } from '../controllers/statsController.js';

const r = Router();

// Rutas de estadísticas (requieren autenticación)
r.get('/history', requireAuth, getUserHistory);
r.get('/ranking', requireAuth, getGlobalRanking);
r.get('/user', requireAuth, getUserStats);

export default r;
