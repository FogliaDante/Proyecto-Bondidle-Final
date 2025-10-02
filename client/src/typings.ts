export type ClassicFeedback = {
  numero: 'red' | 'yellow' | 'green';
  ramal: 'red' | 'yellow' | 'green';
  empresa: 'red' | 'yellow' | 'green';
  colores: 'red' | 'yellow' | 'green';
  terminal_inicio: 'red' | 'yellow' | 'green';
  terminal_final: 'red' | 'yellow' | 'green';
  zona: 'red' | 'yellow' | 'green';
  anio: 'green' | 'yellow';
  anioDirection: 'up' | 'down' | null;
  hints: string[];
};

export type ClassicGuessView = {
  numero: number | null;
  ramalNombre: string | null;
  empresas: string[];
  colores: string[];
  inicio: string | null;
  final: string | null;
  zona: 'CABA' | 'Provincia' | 'AMBA' | null;
  anio_creacion: number | null;
};
  