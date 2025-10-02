import { Request, Response } from 'express';
import { pool } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';


const registerSchema = z.object({
    nombre: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6)
});


export async function register(req: Request, res: Response) {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    const { nombre, email, password } = parse.data;
    const [exists] = await pool.query('SELECT id_usuario FROM Usuarios WHERE email = ?', [email]);
    if ((exists as any[]).length) return res.status(409).json({ error: 'Email ya registrado' });
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
        'INSERT INTO Usuarios (nombre, email, password_hash) VALUES (?, ?, ?)',
        [nombre, email, hash]
    );
    const id = (result as any).insertId;
    const token = jwt.sign({ sub: id, email }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id_usuario: id, nombre, email } });
}


const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
export async function login(req: Request, res: Response) {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    const { email, password } = parse.data;
    const [rows] = await pool.query('SELECT * FROM Usuarios WHERE email = ? LIMIT 1', [email]);
    const user = (rows as any[])[0];
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = jwt.sign({ sub: user.id_usuario, email }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
    res.json({ token, user: { id_usuario: user.id_usuario, nombre: user.nombre, email: user.email } });
}