import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Token requerido' });
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        (req as any).userId = payload.sub;
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Token inválido' });
    }
}