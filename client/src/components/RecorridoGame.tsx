import React, { useEffect, useState } from 'react';
import { getRecorridoQuestion, postRecorridoAnswer, searchColectivos, getRamales } from '../api/games';
import { useI18n } from '../i18n';

export default function RecorridoGame() {
    const { t, lang } = useI18n();

    // Estados principales
    const [q, setQ] = useState<{ questionId: number; imageUrl: string } | null>(null);
    const [numero, setNumero] = useState('');
    const [ramalNombre, setRamalNombre] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [hasError, setHasError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [usedBranches, setUsedBranches] = useState<Set<string>>(new Set());

    // Estados para búsqueda de colectivos y ramales
    const [colectivos, setColectivos] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [ramales, setRamales] = useState<any[]>([]);

    // Función para cargar nueva pregunta
    const load = async () => {
        try {
            const r = await getRecorridoQuestion();
            setQ(r);
            // Resetear estado
            setResult(null);
            setIsCorrect(null);
            setNumero('');
            setRamalNombre('');
            setHasError(false);
            setErrorMessage('');
            setUsedBranches(new Set());
            setColectivos([]);
            setSelectedId(null);
            setRamales([]);
        } catch {
            setQ(null);
        }
    };

    // Efecto inicial
    useEffect(() => { load(); }, []);

    // Efecto para buscar colectivos por número
    useEffect(() => {
        if (numero.length >= 1) { // Buscar desde el primer carácter
            let alive = true;
            searchColectivos(numero).then(list => { if (alive) setColectivos(list); });
            return () => { alive = false; };
        } else {
            setColectivos([]);
        }
    }, [numero]);

    // Efecto para obtener ramales del colectivo seleccionado
    useEffect(() => {
        if (selectedId) {
            getRamales(selectedId).then(setRamales);
            setUsedBranches(new Set());
        } else {
            setRamales([]);
            setUsedBranches(new Set());
        }
    }, [selectedId]);

    // Efecto para traducir resultado
    useEffect(() => {
        if (isCorrect !== null) {
            setResult(isCorrect ? t('route.correct') : t('route.incorrect'));
        }
    }, [lang, isCorrect, t]);

    // Función principal: enviar respuesta
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!q) return;

        setResult(null);
        setIsCorrect(null);
        setHasError(false);
        setErrorMessage('');

        // Validaciones
        if (!numero || numero.trim() === '') {
            setHasError(true);
            setErrorMessage(t('route.selectNumber'));
            return;
        }

        if (!ramalNombre || ramalNombre.trim() === '') {
            setHasError(true);
            setErrorMessage(t('route.selectBranch'));
            return;
        }

        if (usedBranches.has(ramalNombre.trim())) {
            setHasError(true);
            setErrorMessage(t('route.branchAlreadyUsed'));
            return;
        }

        // Enviar respuesta
        const { correct } = await postRecorridoAnswer({
            questionId: q.questionId,
            numero: Number(numero),
            ramalNombre: ramalNombre || undefined
        });

        setIsCorrect(correct);

        // Agregar ramal a usados si no fue correcto
        if (!correct) {
            setUsedBranches(prev => new Set(prev).add(ramalNombre));
        }
    };

    // Render principal
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
                            onChange={e => {
                                setNumero(e.target.value);
                                setHasError(false);
                                setErrorMessage('');
                                setSelectedId(null);
                                setRamales([]);
                                setColectivos([]);
                            }}
                            placeholder={t('route.numberPlaceholder')}
                        />

                        {/* Sugerencias de colectivos */}
                        {colectivos.length > 0 && (
                            <div style={{ marginTop: 4 }}>
                                {colectivos
                                    .filter(c => c.numero.toString().startsWith(numero))
                                    .slice(0, 5)
                                    .map(c => (
                                        <button
                                            key={c.id_colectivo}
                                            type="button"
                                            className="btn btn-small"
                                            style={{ marginRight: 4, marginBottom: 4 }}
                                            onClick={() => {
                                                setNumero(c.numero.toString());
                                                setSelectedId(c.id_colectivo);
                                                setColectivos([]);
                                                setRamales([]);
                                            }}
                                        >
                                            {c.numero}
                                        </button>
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* Selector de ramal */}
                    <div className="col-6">
                        <label>{t('route.branchLabel')}</label>
                        <select
                            className="input"
                            value={ramalNombre}
                            onChange={e => {
                                setRamalNombre(e.target.value);
                                setHasError(false);
                                setErrorMessage('');
                            }}
                            disabled={!selectedId}
                        >
                            <option value="">
                                {selectedId ? t('classic.selectBranch') : t('route.selectBusFirst')}
                            </option>
                            {ramales
                                .filter((r: any) => !usedBranches.has(r.nombre_ramal))
                                .map((r: any) => (
                                    <option key={r.id_ramal} value={r.nombre_ramal}>{r.nombre_ramal}</option>
                                ))}
                            {ramales
                                .filter((r: any) => usedBranches.has(r.nombre_ramal))
                                .map((r: any) => (
                                    <option key={r.id_ramal} value={r.nombre_ramal} disabled style={{ opacity: 0.5 }}>
                                        {r.nombre_ramal} ({t('classic.branchUsed')})
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Botones */}
                    <div className="col-12" style={{ display: 'flex', gap: 8 }}>
                        <button className="btn celeste" type="submit">{t('route.submit')}</button>
                        <button className="btn amarillo" type="button" onClick={load}>{t('route.anotherImage')}</button>
                    </div>
                </form>

                {/* Mensaje de error */}
                {hasError && (
                    <p style={{ color: '#ff6b81', marginTop: 8 }}>
                        {errorMessage.startsWith('Este ramal')
                            ? errorMessage
                            : t(errorMessage)}
                    </p>
                )}

                {/* Feedback del resultado */}
                {result && (
                    <p style={{ marginTop: 8, color: isCorrect ? '#00ff00' : '#ff6b81' }}>{result}</p>
                )}
            </div>
        </div>
    );
}
