import { Router } from 'express';
import { pool } from '../db.js';
const r = Router();


r.get('/colectivos', async (req, res) => {
    const term = (req.query.term as string) || '';
    const [rows] = await pool.query(
        `SELECT id_colectivo, numero FROM Colectivos
WHERE ? = '' OR CAST(numero AS CHAR) LIKE CONCAT('%', ?, '%')
ORDER BY numero ASC LIMIT 50`, [term, term]
    );
    res.json(rows);
});


r.get('/ramales', async (req, res) => {
    const id = Number(req.query.colectivo_id);
    if (!id) return res.status(400).json({ error: 'colectivo_id requerido' });
    const [rows] = await pool.query(`SELECT id_ramal, nombre_ramal FROM Ramales WHERE id_colectivo=? ORDER BY nombre_ramal ASC`, [id]);
    res.json(rows);
});


export default r;