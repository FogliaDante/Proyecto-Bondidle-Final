import React, { useEffect, useState } from 'react';
import { getRecorridoQuestion, postRecorridoAnswer } from '../api/games';

export default function RecorridoGame() {
    // -------------------------
    // 🧩 Estados principales
    // -------------------------
    const [q, setQ] = useState<{ questionId: number; imageUrl: string } | null>(null); // pregunta actual (id + imagen)
    const [numero, setNumero] = useState('');       // input del número de colectivo
    const [ramalNombre, setRamalNombre] = useState(''); // input del ramal
    const [result, setResult] = useState<string | null>(null); // resultado de la respuesta

    // -------------------------
    // 🔄 Función para cargar nueva pregunta
    // -------------------------
    const load = async () => {
        try {
            const r = await getRecorridoQuestion();
            setQ(r);
            // resetear estado de inputs y resultado
            setResult(null);
            setNumero('');
            setRamalNombre('');
        } catch {
            setQ(null); // si falla, no hay pregunta disponible
        }
    };

    // -------------------------
    // ⏳ Efecto inicial: cargar primera pregunta
    // -------------------------
    useEffect(() => { load(); }, []);

    // -------------------------
    // 🎯 Función principal: enviar respuesta
    // -------------------------
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!q) return; // seguridad si no hay pregunta cargada
        setResult(null);

        // mandar respuesta al backend
        const { correct } = await postRecorridoAnswer({
            questionId: q.questionId,
            numero: Number(numero),
            ramalNombre: ramalNombre || undefined
        });

        // actualizar feedback en pantalla
        setResult(correct ? '¡Correcto!' : 'Incorrecto');
    };

    // -------------------------
    // 🎨 Render principal
    // -------------------------
    return (
        <div className="container">
            <div className="card">
                <h2>Recorrido — Adiviná por la imagen</h2>

                {/* Imagen del recorrido */}
                {q ? (
                    <img className="rec" src={q.imageUrl} alt="Recorrido" />
                ) : (
                    <p>No hay imagen disponible.</p>
                )}

                {/* Formulario de respuesta */}
                <form onSubmit={onSubmit} className="grid" style={{ marginTop: 12 }}>
                    {/* Input número */}
                    <div className="col-6">
                        <label>Número</label>
                        <input
                            className="input"
                            value={numero}
                            onChange={e => setNumero(e.target.value)}
                            placeholder="Ej: 60"
                        />
                    </div>

                    {/* Input ramal */}
                    <div className="col-6">
                        <label>Ramal</label>
                        <input
                            className="input"
                            value={ramalNombre}
                            onChange={e => setRamalNombre(e.target.value)}
                            placeholder="Ej: A"
                        />
                    </div>

                    {/* Botones */}
                    <div className="col-12" style={{ display: 'flex', gap: 8 }}>
                        <button className="btn" type="submit">Responder</button>
                        <button className="btn" type="button" onClick={load}>Otra imagen</button>
                    </div>
                </form>

                {/* Feedback del resultado */}
                {result && <p style={{ marginTop: 8 }}>{result}</p>}
            </div>
        </div>
    );
}
