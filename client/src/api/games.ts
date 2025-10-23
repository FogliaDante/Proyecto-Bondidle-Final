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

// Stats endpoints
export const getUserHistory = () => http<{ history: any[] }>(`/stats/history`);
export const getGlobalRanking = () => http<{ ranking: any[] }>(`/stats/ranking`);
export const getUserStats = () => http<{ stats: any }>(`/stats/user`);

// Admin endpoints
export const getAllColectivos = () => http<{ colectivos: any[] }>(`/admin/colectivos`);
export const getAllUsers = () => http<{ users: any[] }>(`/admin/users`);
export const getDailyBus = () => http<{ date: string; bus: any }>(`/admin/daily-bus`);
export const getSystemStats = () => http<{ stats: any }>(`/admin/stats`);