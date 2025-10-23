import { Request, Response } from 'express';
import { pool } from '../db.js';

// ==========================
// HISTORIAL DE JUEGOS
// ==========================

// Obtener historial de juegos del usuario autenticado
export async function getUserHistory(req: Request, res: Response) {
  const userId = (req as any).userId;
  
  try {
    const [rounds] = await pool.query(
      `SELECT 
        cr.id_round,
        cr.puzzle_date,
        cr.attempts,
        cr.completed,
        cr.created_at
      FROM ClassicRounds cr
      WHERE cr.id_usuario = ?
      ORDER BY cr.puzzle_date DESC
      LIMIT 50`,
      [userId]
    );
    
    // Para cada round, obtener los intentos
    const roundsWithGuesses = await Promise.all(
      (rounds as any[]).map(async (round) => {
        const [guesses] = await pool.query(
          `SELECT numero, ramal_nombre, created_at
           FROM ClassicGuesses
           WHERE id_round = ?
           ORDER BY created_at ASC`,
          [round.id_round]
        );
        
        return {
          ...round,
          guesses
        };
      })
    );
    
    res.json({ history: roundsWithGuesses });
  } catch (error) {
    console.error('Error fetching user history:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
}

// ==========================
// RANKING GLOBAL
// ==========================

// Obtener ranking global de usuarios
export async function getGlobalRanking(req: Request, res: Response) {
  try {
    const [ranking] = await pool.query(
      `SELECT 
        u.id_usuario,
        u.nombre_usuario,
        COUNT(cr.id_round) as total_games,
        SUM(cr.completed) as games_won,
        AVG(CASE WHEN cr.completed = 1 THEN cr.attempts ELSE NULL END) as avg_attempts_won,
        MIN(CASE WHEN cr.completed = 1 THEN cr.attempts ELSE NULL END) as best_attempts
      FROM Usuarios u
      LEFT JOIN ClassicRounds cr ON u.id_usuario = cr.id_usuario
      GROUP BY u.id_usuario, u.nombre_usuario
      HAVING total_games > 0
      ORDER BY games_won DESC, avg_attempts_won ASC
      LIMIT 100`
    );
    
    res.json({ ranking });
  } catch (error) {
    console.error('Error fetching global ranking:', error);
    res.status(500).json({ error: 'Error al obtener ranking' });
  }
}

// ==========================
// ESTADÍSTICAS DEL USUARIO
// ==========================

// Obtener estadísticas personales del usuario
export async function getUserStats(req: Request, res: Response) {
  const userId = (req as any).userId;
  
  try {
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_games,
        SUM(completed) as games_won,
        AVG(CASE WHEN completed = 1 THEN attempts ELSE NULL END) as avg_attempts_won,
        MIN(CASE WHEN completed = 1 THEN attempts ELSE NULL END) as best_attempts,
        MAX(puzzle_date) as last_played
      FROM ClassicRounds
      WHERE id_usuario = ?`,
      [userId]
    );
    
    const userStats = (stats as any[])[0];
    
    // Calcular racha actual
    const [streakRows] = await pool.query(
      `SELECT puzzle_date, completed
       FROM ClassicRounds
       WHERE id_usuario = ?
       ORDER BY puzzle_date DESC
       LIMIT 30`,
      [userId]
    );
    
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const row of (streakRows as any[])) {
      const puzzleDate = new Date(row.puzzle_date);
      puzzleDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - puzzleDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === currentStreak && row.completed === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    res.json({
      stats: {
        ...userStats,
        current_streak: currentStreak
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}
