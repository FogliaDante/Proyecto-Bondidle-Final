import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { classicGuess, classicToday, recorridoAnswer, recorridoQuestion } from '../controllers/gamesController.js';


const r = Router();
r.get('/classic/today', requireAuth, classicToday);
r.post('/classic/guess', requireAuth, classicGuess);
r.get('/recorrido/question', requireAuth, recorridoQuestion);
r.post('/recorrido/answer', requireAuth, recorridoAnswer);
export default r;