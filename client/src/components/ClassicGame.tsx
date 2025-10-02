import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClassicToday, postClassicGuess, searchColectivos, getRamales } from '../api/games';
import type { ClassicFeedback, ClassicGuessView } from '../typings';
import { useI18n } from '../i18n';

// Tipo que representa un intento del jugador
type Attempt = { feedback: ClassicFeedback; guess: ClassicGuessView };

export default function ClassicGame() {
  // -------------------------
  // 🔤 Internacionalización
  // -------------------------
  const { t, trHintKeyFromText, trColor, lang } = useI18n();
  const navigate = useNavigate();

  // -------------------------
  // 🧩 Estados principales del juego
  // -------------------------
  const [puzzleKey, setPuzzleKey] = useState<string>('');  // clave del puzzle del día
  const [term, setTerm] = useState('');                   // término buscado (input número colectivo)
  const [colectivos, setColectivos] = useState<any[]>([]);// lista de colectivos encontrados
  const [selectedId, setSelectedId] = useState<number | null>(null); // colectivo elegido
  const [ramales, setRamales] = useState<any[]>([]);      // lista de ramales del colectivo
  const [ramalNombre, setRamalNombre] = useState<string>(''); // ramal seleccionado
  const [attempts, setAttempts] = useState<Attempt[]>([]); // intentos previos
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorType, setErrorType] = useState<'selectBus' | 'guessNotFound' | 'selectBranch' | null>(null);
  const [isGameWon, setIsGameWon] = useState<boolean>(false); // estado de victoria

  // -------------------------
  // ⏳ Efecto 1: obtener puzzle del día
  // -------------------------
  useEffect(() => {
    getClassicToday()
      .then(r => setPuzzleKey(r.puzzleKey))
      .catch(() => { });
  }, []);

  // -------------------------
  // ⏳ Efecto 2: búsqueda de colectivos al escribir en el input
  // -------------------------
  useEffect(() => {
    let alive = true;
    if (!term) {
      setColectivos([]);
      setHasError(false); // Limpiar error cuando se borra el input
      setErrorType(null);
      return;
    }
    searchColectivos(term).then(list => { if (alive) setColectivos(list); });
    return () => { alive = false; };
  }, [term]);

  // -------------------------
  // ⏳ Efecto 3: obtener ramales de un colectivo seleccionado
  // -------------------------
  useEffect(() => {
    if (selectedId) getRamales(selectedId).then(setRamales);
    else setRamales([]);
  }, [selectedId]);

  // -------------------------
  // 🎯 Función principal: enviar intento
  // -------------------------
  const onGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasError(false);
    setErrorType(null);

    try {
      // Convertir el término a número
      const numero = Number(term);

      // Validar que sea un número válido
      if (isNaN(numero) || numero <= 0) {
        setHasError(true);
        setErrorType('selectBus');
        return;
      }

      // Buscar si el número coincide con algún colectivo disponible
      const colectivoEncontrado = colectivos.find(c => c.numero === numero);

      if (!colectivoEncontrado) {
        setHasError(true);
        setErrorType('selectBus');
        return;
      }

      // Verificar que se haya seleccionado un ramal
      if (!ramalNombre || ramalNombre.trim() === '') {
        setHasError(true);
        setErrorType('selectBranch');
        return;
      }

      // Si encontramos el colectivo, usarlo automáticamente
      if (colectivoEncontrado && colectivoEncontrado.id_colectivo !== selectedId) {
        setSelectedId(colectivoEncontrado.id_colectivo);
      }

      // enviar guess al backend
      const { feedback, guess } = await postClassicGuess({
        numero,
        ramalNombre: ramalNombre || undefined
      });

      // actualizar lista de intentos (máx. 8 visibles)
      setAttempts(prev => [{ feedback, guess }, ...prev].slice(0, 8));

      // Verificar si se ganó el juego (numero y ramal correctos)
      if (feedback.numero === 'green' && feedback.ramal === 'green') {
        setIsGameWon(true);
        setHasError(false); // Limpiar errores al ganar
        setErrorType(null);
      } else {
        // Limpiar error después de intento exitoso pero no ganador
        setHasError(false);
        setErrorType(null);
      }
    } catch (err: any) {
      setHasError(true);
      setErrorType('guessNotFound');
    }
  };

  // -------------------------
  // 🔼 Flechitas para pistas de año
  const arrow = (dir: 'up' | 'down' | null) => dir === 'up' ? '↑' : dir === 'down' ? '↓' : '';

  // -------------------------
  // 📅 Formateo de fechas según idioma
  // -------------------------
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === '...' || dateStr === '') return dateStr;

    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);

      return lang === 'en' ? `${month}/${day}/${year}` : `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  // -------------------------
  // 🎨 Render principal
  // -------------------------
  return (
    <div className="container">
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
      `}</style>
      <div className="card">
        <h2>{t('classic.title', { date: formatDate(puzzleKey) || '...' })}</h2>

        {/* Pantalla de victoria */}
        {isGameWon && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            marginBottom: '24px',
            color: 'white'
          }}>
            <div style={{
              fontSize: '60px',
              marginBottom: '16px',
              animation: 'bounce 1s ease-in-out infinite'
            }}>
              🎉 🚍 ✨
            </div>
            <h2 style={{
              margin: '16px 0',
              fontSize: '28px',
              fontWeight: 'bold'
            }}>
              {t('classic.victory.title')}
            </h2>
            <p style={{
              fontSize: '18px',
              margin: '16px 0 24px',
              opacity: 0.9
            }}>
              {t('classic.victory.message')}
            </p>
            <button
              className="btn"
              onClick={() => navigate('/recorrido')}
              style={{
                background: 'white',
                color: '#667eea',
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {t('classic.victory.nextGame')}
            </button>
          </div>
        )}

        {/* Formulario de búsqueda y selección - ocultar cuando se gana */}
        {!isGameWon && (
        <form className="grid" onSubmit={onGuess} style={{ marginTop: 12 }}>
          {/* Columna 1: buscar colectivo */}
          <div className="col-6">
            <label>{t('classic.searchNumber')}</label>
            <input
              className="input"
              placeholder={t('classic.numberPlaceholder')}
              value={term}
              onChange={e => {
                setTerm(e.target.value);
                setHasError(false); // Limpiar error al escribir
                setErrorType(null);
              }}
            />
            {/* Resultados de búsqueda */}
            <div style={{ maxHeight: 160, overflow: 'auto', marginTop: 8 }}>
              {colectivos.map(c => (
                <div key={c.id_colectivo} className="row" style={{ justifyContent: 'space-between' }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setSelectedId(c.id_colectivo);
                      setTerm(String(c.numero));
                      setHasError(false); // Limpiar error al seleccionar colectivo
                      setErrorType(null);
                    }}
                  >
                    #{c.numero}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Columna 2: seleccionar ramal */}
          <div className="col-6">
            <label>{t('classic.branchLabel')}</label>
            <select className="input" value={ramalNombre} onChange={e => {
              setRamalNombre(e.target.value);
              setHasError(false); // Limpiar error al cambiar ramal
              setErrorType(null);
            }}>
              <option value="">{t('classic.anyBranch')}</option>
              {ramales.map((r: any) => (
                <option key={r.id_ramal} value={r.nombre_ramal}>{r.nombre_ramal}</option>
              ))}
            </select>

            {/* Botón de probar intento */}
            <div style={{ marginTop: 12 }}>
              <button className="btn" type="submit">{t('classic.try')}</button>
            </div>

            {/* Mensaje de error */}
            {hasError && (
              <p style={{ color: '#ff6b81' }}>
                {errorType === 'selectBus' 
                  ? (t('classic.selectBus') || 'Elegí un colectivo.')
                  : errorType === 'selectBranch'
                  ? (t('classic.selectBranch') || 'Elegí un ramal.')
                  : (t('classic.guessNotFound') || 'No se encontró ese colectivo/ramal')
                }
              </p>
            )}
          </div>
        </form>
        )}
      </div>

      {/* Historial de intentos */}
      <div className="grid" style={{ marginTop: 16 }}>
        <div className="col-12">
          <h3>{t('classic.attempts')}</h3>
          {attempts.length === 0 && <p className="muted">{t('classic.noAttempts')}</p>}

          {attempts.map(({ feedback: f, guess: g }, i) => {
            const zoneText = g.zona ? t(`zone.${g.zona}`) : '—';
            return (
              <div key={i} className="card" style={{ marginBottom: 8 }}>
                {/* Encabezados y badges organizados en columnas */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {/* Número */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', opacity: 0.6 }}>{t('classic.header.number')}</span>
                    <span className={`badge ${f.numero}`}>{g.numero ?? '—'}</span>
                  </div>
                  
                  {/* Ramal */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', opacity: 0.6 }}>{t('classic.header.branch')}</span>
                    <span className={`badge ${f.ramal}`}>{g.ramalNombre || '—'}</span>
                  </div>
                  
                  {/* Empresa */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', opacity: 0.6 }}>{t('classic.header.company')}</span>
                    <span className={`badge ${f.empresa}`}>{g.empresas?.length ? g.empresas.join(', ') : '—'}</span>
                  </div>
                  
                  {/* Colores */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', opacity: 0.6 }}>{t('classic.header.colors')}</span>
                    <span className={`badge ${f.colores}`}>
                      {g.colores?.length ? g.colores.map(color => trColor(color)).join(', ') : '—'}
                    </span>
                  </div>
                  
                  {/* Terminal Inicio */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', opacity: 0.6 }}>{t('classic.header.startTerminal')}</span>
                    <span className={`badge ${f.terminal_inicio}`}>{g.inicio || '—'}</span>
                  </div>
                  
                  {/* Terminal Final */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', opacity: 0.6 }}>{t('classic.header.endTerminal')}</span>
                    <span className={`badge ${f.terminal_final}`}>{g.final || '—'}</span>
                  </div>
                  
                  {/* Zona */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', opacity: 0.6 }}>{t('classic.header.zone')}</span>
                    <span className={`badge ${f.zona}`}>{zoneText}</span>
                  </div>
                  
                  {/* Año */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', opacity: 0.6 }}>{t('classic.header.year')}</span>
                    <span className={`badge ${f.anio}`}>{g.anio_creacion ?? '—'} {arrow(f.anioDirection)}</span>
                  </div>
                </div>

                {/* Lista de hints */}
                {f.hints.length > 0 && (
                  <ul>
                    {f.hints.map((h, j) => {
                      const key = trHintKeyFromText(h);
                      return <li key={j}>{key.startsWith('hints.') ? t(key) : h}</li>;
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
