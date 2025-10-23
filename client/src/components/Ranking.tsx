import React, { useEffect, useState } from 'react';
import { getGlobalRanking } from '../api/games';
import { useI18n } from '../i18n';

export default function Ranking() {
  const { t } = useI18n();
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRanking();
  }, []);

  const loadRanking = async () => {
    try {
      setLoading(true);
      const data = await getGlobalRanking();
      setRanking(data.ranking);
    } catch (error) {
      console.error('Error loading ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return `${position}°`;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <h2>{t('history.loading')}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h2>🏆 {t('ranking.title')}</h2>
        <p style={{ opacity: 0.7, marginTop: 8 }}>
          {t('ranking.subtitle')}
        </p>

        {ranking.length === 0 ? (
          <p className="muted" style={{ marginTop: 16 }}>
            {t('ranking.noData')}
          </p>
        ) : (
          <div style={{ marginTop: 24 }}>
            {/* Encabezado de tabla */}
            <div 
              style={{ 
                display: 'grid',
                gridTemplateColumns: '60px 1fr 100px 100px 120px',
                gap: 12,
                padding: '12px 16px',
                background: '#f5f5f5',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 12,
                textTransform: 'uppercase',
                opacity: 0.7,
                marginBottom: 8
              }}
            >
              <div>{t('ranking.position')}</div>
              <div>{t('ranking.player')}</div>
              <div style={{ textAlign: 'center' }}>{t('ranking.played')}</div>
              <div style={{ textAlign: 'center' }}>{t('ranking.won')}</div>
              <div style={{ textAlign: 'center' }}>{t('ranking.avgAttempts')}</div>
            </div>

            {/* Filas de ranking */}
            {ranking.map((player, idx) => {
              const position = idx + 1;
              const isTopThree = position <= 3;
              
              return (
                <div
                  key={player.id_usuario}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 100px 100px 120px',
                    gap: 12,
                    padding: '16px',
                    background: isTopThree 
                      ? 'linear-gradient(135deg, #fff9e6 0%, #ffe8a1 100%)'
                      : 'white',
                    borderRadius: 8,
                    marginBottom: 8,
                    border: isTopThree ? '2px solid #ffd700' : '1px solid #e0e0e0',
                    alignItems: 'center',
                    transition: 'transform 0.2s ease',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  {/* Posición */}
                  <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                    {getMedalEmoji(position)}
                  </div>

                  {/* Nombre del jugador */}
                  <div style={{ fontWeight: 600, fontSize: 16 }}>
                    {player.nombre_usuario}
                  </div>

                  {/* Juegos totales */}
                  <div style={{ textAlign: 'center', fontSize: 16 }}>
                    {player.total_games}
                  </div>

                  {/* Juegos ganados */}
                  <div style={{ textAlign: 'center', fontSize: 16, color: '#48bb78', fontWeight: 'bold' }}>
                    {player.games_won || 0}
                  </div>

                  {/* Promedio de intentos */}
                  <div style={{ textAlign: 'center', fontSize: 16 }}>
                    {player.avg_attempts_won ? Number(player.avg_attempts_won).toFixed(1) : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
