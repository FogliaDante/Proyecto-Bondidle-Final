import { pool } from '../db.js';

// ==========================
// OBTENER TODAS LAS PAREJAS
// ==========================
// Devuelve todos los colectivos junto con sus ramales
export async function getAllPairs() {
  const [rows] = await pool.query(
    `SELECT r.id_ramal, c.id_colectivo, c.numero, r.nombre_ramal, r.inicio, r.final
     FROM Ramales r JOIN Colectivos c ON r.id_colectivo = c.id_colectivo
     ORDER BY r.id_ramal ASC`
  );
  return rows as any[];
}


// ==========================
// GENERAR CLAVE DEL DÍA
// ==========================
// Devuelve la fecha actual en formato YYYY-MM-DD
export function dateKey(tz = process.env.TZ || 'America/Argentina/Buenos_Aires') {
  const d = new Date();
  return d.toLocaleDateString('en-CA', { timeZone: tz }); // Formato ISO simplificado
}


// ==========================
// ELEGIR PAREJA DIARIA
// ==========================
// Selecciona un colectivo/ramal "del día" de forma determinista
export async function pickDailyPair(): Promise<{ id_ramal: number; id_colectivo: number } | null> {
  const pairs = await getAllPairs(); // Obtener todas las parejas
  if (pairs.length === 0) return null; // Si no hay datos, devolver null

  const key = dateKey(); // Obtener clave del día
  // Sumar los códigos de los caracteres de la fecha
  const sum = [...key].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const idx = sum % pairs.length; // Elegir índice determinista según la suma
  const p = pairs[idx];
  return { id_ramal: p.id_ramal, id_colectivo: p.id_colectivo };
}


// ==========================
// SNAPSHOT DE UN COLECTIVO
// ==========================
// Devuelve todos los datos de un colectivo (colores, empresas, ramal, etc.)
export async function getColectivoSnapshot(id_colectivo: number, id_ramal?: number) {
  // Obtener empresas del colectivo
  const [empRows] = await pool.query(
    `SELECT e.nombre FROM Empresas e
     JOIN Empresa_Colectivo ec ON ec.id_empresa = e.id_empresa
     WHERE ec.id_colectivo = ?`, [id_colectivo]
  );

  // Obtener colores del colectivo
  const [colRows] = await pool.query(
    `SELECT c.color FROM Colores c
     JOIN Colectivo_Color cc ON cc.id_color = c.id_color
     WHERE cc.id_colectivo = ?`, [id_colectivo]
  );

  // Obtener datos principales del colectivo y ramal
  const [mainRows] = await pool.query(
    `SELECT c.numero, c.zona, c.anio_creacion, r.nombre_ramal, r.inicio, r.final
     FROM Colectivos c
     LEFT JOIN Ramales r ON r.id_colectivo = c.id_colectivo
     WHERE c.id_colectivo = ? AND (? IS NULL OR r.id_ramal = ?)
     LIMIT 1`, [id_colectivo, id_ramal ?? null, id_ramal ?? null]
  );

  const m = (mainRows as any[])[0] || {};
  
  // Construir snapshot completo
  return {
    numero: m.numero ?? null,
    ramalNombre: m.nombre_ramal ?? null,
    inicio: m.inicio ?? null,
    final: m.final ?? null,
    zona: m.zona ?? null,
    anio_creacion: m.anio_creacion ?? null,
    empresas: (empRows as any[]).map(r => r.nombre),
    colores: (colRows as any[]).map(r => r.color),
  };
}


// ==========================
// BUSCAR COLECTIVO POR NÚMERO Y RAMAL
// ==========================
export async function findByNumeroAndRamal(numero: number, ramalNombre?: string) {
  const [rows] = await pool.query(
    `SELECT r.id_ramal, c.id_colectivo
     FROM Colectivos c
     LEFT JOIN Ramales r ON r.id_colectivo = c.id_colectivo
     WHERE c.numero = ? AND (? IS NULL OR r.nombre_ramal = ?)
     ORDER BY r.id_ramal IS NULL, r.id_ramal ASC
     LIMIT 1`, [numero, ramalNombre ?? null, ramalNombre ?? null]
  );
  return (rows as any[])[0] || null;
}


// ==========================
// OBTENER RECORRIDO ALEATORIO
// ==========================
// Devuelve un ramal con imagen aleatoria para el modo "Recorrido"
export async function getRandomRecorrido() {
  const [rows] = await pool.query(
    `SELECT r.id_ramal, r.imagen_recorrido, c.numero, r.nombre_ramal
     FROM Ramales r JOIN Colectivos c ON r.id_colectivo = c.id_colectivo
     WHERE r.imagen_recorrido IS NOT NULL AND r.imagen_recorrido <> ''
     ORDER BY RAND() LIMIT 1`
  );
  return (rows as any[])[0] || null;
}