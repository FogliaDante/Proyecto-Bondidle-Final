import { Request, Response } from 'express';
import { evaluateClassic } from '../utils/evaluateClassic.js';
import { findByNumeroAndRamal, getColectivoSnapshot, getRandomRecorrido, pickDailyPair } from '../services/gameService.js';


// ==========================
// CLÁSICO (Wordle)
// ==========================

// Devuelve el "puzzle del día" para el modo clásico
export async function classicToday(req: Request, res: Response) {
  const p = await pickDailyPair(); // Elegir colectivo y ramal del día
  if (!p) return res.status(404).json({ error: 'No hay datos cargados' });

  // En este caso, devolvemos solo la fecha como "puzzleKey"
  res.json({ puzzleKey: new Date().toISOString().slice(0, 10) });
}

// Recibe un intento del usuario y devuelve el feedback estilo Wordle
export async function classicGuess(req: Request, res: Response) {
  const { numero, ramalNombre } = req.body || {};
  if (!numero) return res.status(400).json({ error: 'numero requerido' });

  const userId = (req as any).userId; // ID del usuario autenticado
  const puzzleDate = new Date().toISOString().slice(0, 10); // Fecha del puzzle

  const picked = await pickDailyPair(); // Colectivo y ramal del día
  if (!picked) return res.status(404).json({ error: 'No hay datos para jugar' });

  // Snapshot del objetivo (respuesta correcta)
  const target = await getColectivoSnapshot(picked.id_colectivo, picked.id_ramal);

  // Buscar si el intento existe en la BD
  const match = await findByNumeroAndRamal(Number(numero), ramalNombre);
  if (!match) return res.status(404).json({ error: 'No se encontró ese colectivo/ramal' });

  // Snapshot del intento del usuario
  const guess = await getColectivoSnapshot(match.id_colectivo, match.id_ramal);

  // Evaluar el feedback (rojo/amarillo/verde por campo)
  const feedback = evaluateClassic(target, guess);

  // Verificar si el intento es correcto
  const isCorrect = feedback.numero === 'green' && feedback.ramal === 'green';

  // Guardar el intento en la base de datos
  await saveClassicAttempt(userId, puzzleDate, numero, ramalNombre, isCorrect);

  // Devolver feedback y datos del intento al frontend
  res.json({ feedback, guess });
}


// ==========================
// RECORRIDO (imagen)
// ==========================

// Devuelve una pregunta aleatoria con imagen
export async function recorridoQuestion(req: Request, res: Response) {
  const r = await getRandomRecorrido(); // Obtener recorrido aleatorio
  if (!r) return res.status(404).json({ error: 'Faltan recorridos con imagen' });

  // Enviar id de ramal y URL de la imagen al frontend
  res.json({ questionId: r.id_ramal, imageUrl: r.imagen_recorrido });
}

// Recibe la respuesta del usuario y verifica si es correcta
export async function recorridoAnswer(req: Request, res: Response) {
  const { questionId, numero, ramalNombre } = req.body || {};
  if (!questionId || !numero) return res.status(400).json({ error: 'questionId y numero requeridos' });

  // Obtener snapshot del ramal objetivo
  const target = await getColectivoSnapshotByRamal(questionId);
  if (!target) return res.status(404).json({ error: 'Pregunta inválida' });

  // Buscar intento en la BD
  const match = await findByNumeroAndRamal(Number(numero), ramalNombre);
  if (!match) return res.json({ correct: false });

  // Snapshot del intento
  const guess = await getColectivoSnapshot(match.id_colectivo, match.id_ramal);

  // Comparar intento vs objetivo
  const correct = target.numero === guess.numero && (!target.ramalNombre || target.ramalNombre === guess.ramalNombre);

  // Devolver si el intento es correcto
  res.json({ correct });
}


// ==========================
// HELPERS
// ==========================

// Guarda un intento de juego clásico en la base de datos
async function saveClassicAttempt(userId: number, puzzleDate: string, numero: number, ramalNombre: string | undefined, isCorrect: boolean) {
  const { pool } = await import('../db.js');
  
  // Buscar o crear round para este usuario y fecha
  const [roundRows] = await pool.query(
    `SELECT id_round, attempts, completed FROM ClassicRounds 
     WHERE id_usuario = ? AND puzzle_date = ?`,
    [userId, puzzleDate]
  );
  
  let roundId: number;
  let currentAttempts = 0;
  
  if ((roundRows as any[]).length === 0) {
    // Crear nuevo round
    const [result] = await pool.query(
      `INSERT INTO ClassicRounds (id_usuario, puzzle_date, attempts, completed) 
       VALUES (?, ?, 1, ?)`,
      [userId, puzzleDate, isCorrect ? 1 : 0]
    );
    roundId = (result as any).insertId;
    currentAttempts = 1;
  } else {
    // Actualizar round existente
    const round = (roundRows as any[])[0];
    roundId = round.id_round;
    currentAttempts = round.attempts + 1;
    
    await pool.query(
      `UPDATE ClassicRounds 
       SET attempts = ?, completed = ? 
       WHERE id_round = ?`,
      [currentAttempts, isCorrect ? 1 : round.completed, roundId]
    );
  }
  
  // Guardar el intento específico
  await pool.query(
    `INSERT INTO ClassicGuesses (id_round, numero, ramal_nombre) 
     VALUES (?, ?, ?)`,
    [roundId, numero, ramalNombre || null]
  );
}

// Devuelve snapshot completo de un ramal específico
async function getColectivoSnapshotByRamal(id_ramal: number) {
  const sql = `SELECT c.id_colectivo, c.numero, r.nombre_ramal, r.inicio, r.final
    FROM Ramales r JOIN Colectivos c ON r.id_colectivo=c.id_colectivo
    WHERE r.id_ramal=? LIMIT 1`;
  
  const { pool } = await import('../db.js');
  const [rows] = await pool.query(sql, [id_ramal]);
  const row = (rows as any[])[0];
  if (!row) return null;

  const snap = await import('../services/gameService.js');
  return snap.getColectivoSnapshot(row.id_colectivo, id_ramal);
}