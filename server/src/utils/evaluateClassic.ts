import { ClassicFeedback } from '../types.js';

// ==========================
// EVALUAR INTENTO DEL JUGADOR
// ==========================
// Compara el "guess" del jugador con el "target" correcto
// y devuelve un objeto ClassicFeedback con colores y hints.
export function evaluateClassic(target: any, guess: any): ClassicFeedback {
  const fb: ClassicFeedback = {
    numero: eq(target.numero, guess.numero) ? 'green' : 'red', // Verde si el número es exacto
    ramal: eq(target.ramalNombre, guess.ramalNombre)
      ? 'green'
      : (eq(target.numero, guess.numero) ? 'yellow' : 'red'), // Amarillo si número acertado pero ramal no
    empresa: 'red',        // Inicialmente rojo, se calcula después
    colores: 'red',        // Inicialmente rojo, se calcula después
    terminal_inicio: 'red',// Inicialmente rojo, se calcula después
    terminal_final: 'red', // Inicialmente rojo, se calcula después
    zona: eq(target.zona, guess.zona) ? 'green' : 'red', // Verde si coincide la zona
    anio: 'yellow',        // Inicialmente amarillo, se ajusta según año
    anioDirection: null,   // Dirección de flecha (up/down) para año
    hints: [],             // Mensajes de ayuda para el jugador
  };

  // ==========================
  // EMPRESA: comparación de conjuntos
  // ==========================
  const empInter = intersect(ary(target.empresas), ary(guess.empresas));
  if (empInter.length === 0) fb.empresa = 'red';
  else if (sameSet(ary(target.empresas), ary(guess.empresas))) fb.empresa = 'green';
  else fb.empresa = 'yellow';

  // ==========================
  // COLORES: mismo criterio que empresas
  // ==========================
  const colInter = intersect(ary(target.colores), ary(guess.colores));
  if (colInter.length === 0) fb.colores = 'red';
  else if (sameSet(ary(target.colores), ary(guess.colores))) fb.colores = 'green';
  else fb.colores = 'yellow';

  // ==========================
  // TERMINALES
  // ==========================
  fb.terminal_inicio = cmpText(target.inicio, guess.inicio);
  fb.terminal_final = cmpText(target.final, guess.final);

  // ==========================
  // AÑO: determinar color y dirección de flecha
  // ==========================
  const ty = toNum(target.anio_creacion);
  const gy = toNum(guess.anio_creacion);
  if (ty != null && gy != null) {
    if (ty === gy) { 
      fb.anio = 'green'; 
      fb.anioDirection = null; 
    } else { 
      fb.anio = 'yellow'; 
      fb.anioDirection = ty > gy ? 'up' : 'down'; 
    }
  } else {
    fb.anio = 'yellow';
    fb.anioDirection = null;
  }

  // ==========================
  // HINTS: mensajes de ayuda
  // ==========================
  if (fb.numero !== 'green') fb.hints.push('El número es diferente.');
  if (fb.ramal !== 'green' && fb.numero === 'green') fb.hints.push('Adivinaste el número, pero el ramal no.');
  if (fb.colores === 'yellow') fb.hints.push('Uno o más colores coinciden.');
  if (fb.empresa === 'yellow') fb.hints.push('Comparte empresa con el correcto.');
  if (fb.zona === 'red') fb.hints.push('Zona distinta (CABA/Provincia/AMBA).');
  if (fb.anio === 'yellow' && fb.anioDirection) 
    fb.hints.push(fb.anioDirection === 'up' ? 'El correcto es más nuevo.' : 'El correcto es más viejo.');

  return fb;
}


// ==========================
// HELPERS
// ==========================
function ary(x: any): string[] { return Array.isArray(x) ? x : (x ? [x] : []); } // Asegura un array
function norm(s: any) { return String(s ?? '').trim().toLowerCase(); }             // Normaliza texto
function eq(a: any, b: any) { return norm(a) === norm(b); }                        // Comparación estricta ignorando mayúsculas
function toNum(x: any) { const n = Number(x); return Number.isFinite(n) ? n : null; } // Convierte a número seguro

function intersect(a: string[], b: string[]) {
  const B = new Set(b.map(norm));
  return a.filter(x => B.has(norm(x))); // Intersección entre arrays
}

function sameSet(a: string[], b: string[]) {
  const A = new Set(a.map(norm)), B = new Set(b.map(norm));
  if (A.size !== B.size) return false;
  for (const v of A) if (!B.has(v)) return false;
  return true; // Compara si dos sets son iguales
}

function cmpText(t?: string, g?: string): ClassicFeedback['numero'] {
  if (!t && !g) return 'red'; // Ambos vacíos
  if (eq(t, g)) return 'green'; // Exacto
  if (t && g && (norm(t).includes(norm(g)) || norm(g).includes(norm(t)))) return 'yellow'; // Parcial
  return 'red'; // Diferente
}