import { Request, Response } from 'express';
import { pool } from '../db.js';
import { pickDailyPair, getColectivoSnapshot } from '../services/gameService.js';

// ==========================
// MIDDLEWARE DE ADMIN
// ==========================

// Verificar si el usuario es administrador
export async function requireAdmin(req: Request, res: Response, next: any) {
  const userId = (req as any).userId;
  
  try {
    const [rows] = await pool.query(
      `SELECT es_admin FROM Usuarios WHERE id_usuario = ?`,
      [userId]
    );
    
    const user = (rows as any[])[0];
    if (!user || !user.es_admin) {
      return res.status(403).json({ error: 'Acceso denegado: se requieren permisos de administrador' });
    }
    
    next();
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ error: 'Error al verificar permisos' });
  }
}

// ==========================
// VISTA DE COLECTIVOS
// ==========================

// Obtener todos los colectivos con sus detalles
export async function getAllColectivos(req: Request, res: Response) {
  try {
    const [colectivos] = await pool.query(
      `SELECT 
        c.id_colectivo,
        c.numero,
        c.zona,
        c.anio_creacion,
        COUNT(DISTINCT r.id_ramal) as total_ramales,
        GROUP_CONCAT(DISTINCT e.nombre SEPARATOR ', ') as empresas,
        GROUP_CONCAT(DISTINCT col.color SEPARATOR ', ') as colores
      FROM Colectivos c
      LEFT JOIN Ramales r ON c.id_colectivo = r.id_colectivo
      LEFT JOIN Empresa_Colectivo ec ON c.id_colectivo = ec.id_colectivo
      LEFT JOIN Empresas e ON ec.id_empresa = e.id_empresa
      LEFT JOIN Colectivo_Color cc ON c.id_colectivo = cc.id_colectivo
      LEFT JOIN Colores col ON cc.id_color = col.id_color
      GROUP BY c.id_colectivo, c.numero, c.zona, c.anio_creacion
      ORDER BY c.numero ASC`
    );
    
    res.json({ colectivos });
  } catch (error) {
    console.error('Error fetching colectivos:', error);
    res.status(500).json({ error: 'Error al obtener colectivos' });
  }
}

// ==========================
// VISTA DE USUARIOS
// ==========================

// Obtener todos los usuarios con sus estadísticas
export async function getAllUsers(req: Request, res: Response) {
  try {
    const [users] = await pool.query(
      `SELECT 
        u.id_usuario,
        u.nombre_usuario,
        u.email,
        u.es_admin,
        u.fecha_registro,
        COUNT(cr.id_round) as total_games,
        SUM(cr.completed) as games_won,
        MAX(cr.puzzle_date) as last_played
      FROM Usuarios u
      LEFT JOIN ClassicRounds cr ON u.id_usuario = cr.id_usuario
      GROUP BY u.id_usuario, u.nombre_usuario, u.email, u.es_admin, u.fecha_registro
      ORDER BY u.fecha_registro DESC`
    );
    
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
}

// ==========================
// BONDI DEL DÍA
// ==========================

// Obtener el bondi del día para testing
export async function getDailyBus(req: Request, res: Response) {
  try {
    const picked = await pickDailyPair();
    if (!picked) {
      return res.status(404).json({ error: 'No hay datos cargados' });
    }
    
    const snapshot = await getColectivoSnapshot(picked.id_colectivo, picked.id_ramal);
    
    res.json({
      date: new Date().toISOString().slice(0, 10),
      bus: snapshot
    });
  } catch (error) {
    console.error('Error fetching daily bus:', error);
    res.status(500).json({ error: 'Error al obtener bondi del día' });
  }
}

// ==========================
// ESTADÍSTICAS GENERALES
// ==========================

// Obtener estadísticas generales del sistema
export async function getSystemStats(req: Request, res: Response) {
  try {
    // Total de usuarios
    const [userCount] = await pool.query(`SELECT COUNT(*) as total FROM Usuarios`);
    
    // Total de colectivos
    const [busCount] = await pool.query(`SELECT COUNT(*) as total FROM Colectivos`);
    
    // Total de juegos jugados
    const [gamesCount] = await pool.query(`SELECT COUNT(*) as total FROM ClassicRounds`);
    
    // Total de juegos ganados
    const [gamesWonCount] = await pool.query(`SELECT COUNT(*) as total FROM ClassicRounds WHERE completed = 1`);
    
    // Juegos jugados hoy
    const today = new Date().toISOString().slice(0, 10);
    const [todayGames] = await pool.query(
      `SELECT COUNT(*) as total FROM ClassicRounds WHERE puzzle_date = ?`,
      [today]
    );
    
    res.json({
      stats: {
        total_users: (userCount as any[])[0].total,
        total_buses: (busCount as any[])[0].total,
        total_games: (gamesCount as any[])[0].total,
        total_games_won: (gamesWonCount as any[])[0].total,
        games_today: (todayGames as any[])[0].total
      }
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas del sistema' });
  }
}
