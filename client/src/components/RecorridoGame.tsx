import React, { useEffect, useState } from 'react';
import { getRecorridoQuestion, postRecorridoAnswer } from '../api/games';
import { useI18n } from '../i18n';

export default function RecorridoGame() {
    const { t, lang } = useI18n();
    // -------------------------
    // 🧩 Estados principales
    // -------------------------
    const [q, setQ] = useState<{ questionId: number; imageUrl: string } | null>(null); // pregunta actual (id + imagen)
    const [numero, setNumero] = useState('');       // input del número de colectivo
    const [ramalNombre, setRamalNombre] = useState(''); // input del ramal
    const [result, setResult] = useState<string | null>(null); // resultado de la respuesta
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null); // si la respuesta fue correcta

    // -------------------------
    // 🔄 Función para cargar nueva pregunta
    // -------------------------
    const load = async () => {
        try {
            const r = await getRecorridoQuestion();
            setQ(r);
            // resetear estado de inputs y resultado
            setResult(null);
            setIsCorrect(null);
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
    // 🔄 Efecto para recalcular mensaje cuando cambia el idioma
    // -------------------------
    useEffect(() => {
        if (isCorrect !== null) {
            setResult(isCorrect ? t('route.correct') : t('route.incorrect'));
        }
    }, [lang, isCorrect, t]);

    // -------------------------
    // 🎯 Función principal: enviar respuesta
    // -------------------------
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!q) return; // seguridad si no hay pregunta cargada
        setResult(null);
        setIsCorrect(null);

        // mandar respuesta al backend
        const { correct } = await postRecorridoAnswer({
            questionId: q.questionId,
            numero: Number(numero),
            ramalNombre: ramalNombre || undefined
        });

        // actualizar feedback en pantalla
        setIsCorrect(correct);
    };

    // -------------------------
    // 🎨 Render principal
    // -------------------------
    return (
        <div className="container">
            <div className="card">
                <h2>{t('route.title')}</h2>

                {/* Imagen del recorrido */}
                {q ? (
                    <img className="rec" src={q.imageUrl} alt={t('route.alt')} />
                ) : (
                    <p>{t('route.noImage')}</p>
                )}

                {/* Formulario de respuesta */}
                <form onSubmit={onSubmit} className="grid" style={{ marginTop: 12 }}>
                    {/* Input número */}
                    <div className="col-6">
                        <label>{t('route.numberLabel')}</label>
                        <input
                            className="input"
                            value={numero}
                            onChange={e => setNumero(e.target.value)}
                            placeholder={t('route.numberPlaceholder')}
                        />
                    </div>

                    {/* Input ramal */}
                    <div className="col-6">
                        <label>{t('route.branchLabel')}</label>
                        <input
                            className="input"
                            value={ramalNombre}
                            onChange={e => setRamalNombre(e.target.value)}
                            placeholder={t('route.branchPlaceholder')}
                        />
                    </div>

                    {/* Botones */}
                    <div className="col-12" style={{ display: 'flex', gap: 8 }}>
                        <button className="btn" type="submit">{t('route.submit')}</button>
                        <button className="btn" type="button" onClick={load}>{t('route.anotherImage')}</button>
                    </div>
                </form>

                {/* Feedback del resultado */}
                {result && <p style={{ marginTop: 8 }}>{result}</p>}
            </div>
        </div>
    );
}
