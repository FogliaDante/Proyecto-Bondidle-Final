import { http } from './http';
export const apiRegister = (data: { nombre: string; email: string; password: string; }) =>
    http<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const apiLogin = (data: { email: string; password: string; }) =>
    http<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) });