import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { 
  requireAdmin, 
  getAllColectivos, 
  getAllUsers, 
  getDailyBus, 
  getSystemStats 
} from '../controllers/adminController.js';

const r = Router();

// Todas las rutas de admin requieren autenticación y permisos de admin
r.use(requireAuth);

// Rutas de administración
r.get('/colectivos', requireAdmin, getAllColectivos);
r.get('/users', requireAdmin, getAllUsers);
r.get('/daily-bus', requireAdmin, getDailyBus);
r.get('/stats', requireAdmin, getSystemStats);

export default r;
