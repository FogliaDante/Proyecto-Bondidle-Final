export type User = { id_usuario: number; nombre: string; email: string; password_hash: string; created_at: string };

export type ClassicFeedbackColor = 'red' | 'yellow' | 'green';

export type ClassicFeedback = {
  numero: ClassicFeedbackColor;
  ramal: ClassicFeedbackColor;
  empresa: ClassicFeedbackColor;
  colores: ClassicFeedbackColor;
  terminal_inicio: ClassicFeedbackColor;
  terminal_final: ClassicFeedbackColor;
  zona: ClassicFeedbackColor;
  anio: 'green' | 'yellow';
  anioDirection: 'up' | 'down' | null; // up = el correcto es más nuevo (año mayor)
  hints: string[];
};
