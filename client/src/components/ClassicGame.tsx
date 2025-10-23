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
  const [usedBranches, setUsedBranches] = useState<Set<string>>(new Set()); // ramales ya utilizados

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
    if (selectedId) {
      getRamales(selectedId).then(setRamales);
      setUsedBranches(new Set()); // Limpiar ramales usados al cambiar de colectivo
    } else {
      setRamales([]);
      setUsedBranches(new Set()); // Limpiar ramales usados si no hay colectivo seleccionado
    }
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

      // Verificar que el ramal no haya sido utilizado ya
      if (usedBranches.has(ramalNombre.trim())) {
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

      // Agregar el ramal utilizado al conjunto de ramales usados
      if (ramalNombre && ramalNombre.trim() !== '') {
        setUsedBranches(prev => new Set(prev).add(ramalNombre));
      }

      // Verificar si se ganó el juego (numero y ramal correctos)
      if (feedback.numero === 'green' && feedback.ramal === 'green') {
        setIsGameWon(true);
        setHasError(false); // Limpiar errores al ganar
        setErrorType(null);
        setUsedBranches(new Set()); // Limpiar ramales usados al ganar
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
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .bus-selected {
          animation: pulse 0.3s ease-in-out;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          transform: scale(1.05);
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
        }
      `}</style>
      <div className="card">
        <h2>{t('classic.title', { date: formatDate(puzzleKey) || '...' })}</h2>

        {/* Pantalla de victoria */}
        {isGameWon && (
          <div style={{
            textAlign: 'center',
            padding: '50px 20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            marginBottom: '24px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            animation: 'fadeInScale 0.5s ease-out',
            boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)'
          }}>
            {/* Confetti effect */}
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '-10px',
                  left: `${Math.random() * 100}%`,
                  width: '10px',
                  height: '10px',
                  background: ['#ffd700', '#ff6b81', '#48bb78', '#4facfe', '#f093fb'][Math.floor(Math.random() * 5)],
                  borderRadius: '50%',
                  animation: `confetti ${2 + Math.random() * 2}s linear ${Math.random() * 0.5}s infinite`,
                  opacity: 0.8
                }}
              />
            ))}
            
            <div style={{
              fontSize: '80px',
              marginBottom: '20px',
              animation: 'bounce 1s ease-in-out infinite',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
            }}>
              🎉 🚍 ✨
            </div>
            <h2 style={{
              margin: '20px 0',
              fontSize: '36px',
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              animation: 'slideInUp 0.6s ease-out 0.2s both'
            }}>
              {t('classic.victory.title')}
            </h2>
            <p style={{
              fontSize: '20px',
              margin: '20px 0 32px',
              opacity: 0.95,
              animation: 'slideInUp 0.6s ease-out 0.3s both'
            }}>
              {t('classic.victory.message')}
            </p>
            <div style={{ animation: 'slideInUp 0.6s ease-out 0.4s both' }}>
              <button
                className="btn"
                onClick={() => navigate('/recorrido')}
                style={{
                  background: 'white',
                  color: '#667eea',
                  padding: '14px 40px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                }}
              >
                {t('classic.victory.nextGame')}
              </button>
            </div>
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
                    className={`btn ${selectedId === c.id_colectivo ? 'bus-selected' : ''}`}
                    onClick={() => {
                      setSelectedId(c.id_colectivo);
                      setTerm(String(c.numero));
                      setHasError(false);
                      setErrorType(null);
                    }}
                    style={{
                      transition: 'all 0.3s ease',
                      transform: selectedId === c.id_colectivo ? 'scale(1.05)' : 'scale(1)'
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

            {/* Botón de probar intento */}
            <div style={{ marginTop: 12 }}>
              <button className="btn celeste" type="submit">{t('classic.try')}</button>
            </div>

            {/* Mensaje de error */}
            {hasError && (
              <p style={{ color: '#ff6b81' }}>
                {errorType === 'selectBus' 
                  ? (t('classic.selectBus') || 'Elegí un colectivo.')
                  : errorType === 'selectBranch' && usedBranches.has(ramalNombre)
                  ? (t('classic.branchAlreadyUsed') || 'Este ramal ya fue utilizado.')
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
