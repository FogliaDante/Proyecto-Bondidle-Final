import { http } from './http';
import type { ClassicFeedback, ClassicGuessView } from '../typings';

export const getClassicToday = () => http<{ puzzleKey: string }>(`/games/classic/today`);

export const postClassicGuess = (payload: { numero: number; ramalNombre?: string; }) =>
  http<{ feedback: ClassicFeedback; guess: ClassicGuessView }>(`/games/classic/guess`, {
    method: 'POST', body: JSON.stringify(payload)
  });


export const getRecorridoQuestion = () => http<{ questionId: number; imageUrl: string }>(`/games/recorrido/question`);
export const postRecorridoAnswer = (payload: { questionId: number; numero: number; ramalNombre?: string; }) =>
  http<{ correct: boolean }>(`/games/recorrido/answer`, { method: 'POST', body: JSON.stringify(payload) });

export const searchColectivos = (term: string) => http<any[]>(`/catalog/colectivos?term=${encodeURIComponent(term)}`);
export const getRamales = (colectivo_id: number) => http<any[]>(`/catalog/ramales?colectivo_id=${colectivo_id}`);
export const searchColectivosByNumber = (numero: number) => http<any[]>(`/catalog/colectivos?numero=${numero}`);