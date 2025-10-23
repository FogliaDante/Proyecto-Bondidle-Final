import React, { useEffect, useState } from 'react';
import { getUserHistory, getUserStats } from '../api/games';
import { useI18n } from '../i18n';

export default function History() {
  const { t, lang } = useI18n();
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [historyData, statsData] = await Promise.all([
        getUserHistory(),
        getUserStats()
      ]);
      setHistory(historyData.history);
      setStats(statsData.stats);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return lang === 'en' ? `${month}/${day}/${year}` : `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
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
      {/* Estadísticas personales */}
      {stats && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h2>📊 {t('history.stats')}</h2>
          <div className="grid" style={{ marginTop: 16 }}>
            <div className="col-3" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 'bold', color: '#667eea' }}>
                {stats.total_games || 0}
              </div>
              <div style={{ fontSize: 14, opacity: 0.7 }}>{t('history.totalGames')}</div>
            </div>
            <div className="col-3" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 'bold', color: '#48bb78' }}>
                {stats.games_won || 0}
              </div>
              <div style={{ fontSize: 14, opacity: 0.7 }}>{t('history.gamesWon')}</div>
            </div>
            <div className="col-3" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 'bold', color: '#f6ad55' }}>
                {stats.avg_attempts_won ? Number(stats.avg_attempts_won).toFixed(1) : '—'}
              </div>
              <div style={{ fontSize: 14, opacity: 0.7 }}>{t('history.avgAttempts')}</div>
            </div>
            <div className="col-3" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 'bold', color: '#fc8181' }}>
                {stats.best_attempts || '—'}
              </div>
              <div style={{ fontSize: 14, opacity: 0.7 }}>{t('history.bestResult')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Historial de juegos */}
      <div className="card">
        <h2>📜 {t('history.title')}</h2>
        
        {history.length === 0 ? (
          <p className="muted" style={{ marginTop: 16 }}>
            {t('history.noGames')}
          </p>
        ) : (
          <div style={{ marginTop: 16 }}>
            {history.map((round, idx) => (
              <div 
                key={round.id_round} 
                className="card" 
                style={{ 
                  marginBottom: 12,
                  background: round.completed ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' : '#f5f5f5'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <strong style={{ fontSize: 16 }}>
                      {formatDate(round.puzzle_date)}
                    </strong>
                    {round.completed ? (
                      <span style={{ marginLeft: 12, color: '#48bb78', fontWeight: 'bold' }}>
                        ✓ {t('history.completed')}
                      </span>
                    ) : (
                      <span style={{ marginLeft: 12, color: '#fc8181' }}>
                        ✗ {t('history.notCompleted')}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, opacity: 0.7 }}>
                    {round.attempts} {round.attempts === 1 ? t('history.attempt') : t('history.attempts')}
                  </div>
                </div>

                {/* Lista de intentos */}
                {round.guesses && round.guesses.length > 0 && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, opacity: 0.6 }}>
                      {t('history.attemptsList')}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {round.guesses.map((guess: any, gIdx: number) => (
                        <span 
                          key={gIdx}
                          className="badge"
                          style={{ 
                            background: 'white',
                            border: '1px solid rgba(0,0,0,0.2)',
                            fontSize: 12
                          }}
                        >
                          #{guess.numero} {guess.ramal_nombre && `- ${guess.ramal_nombre}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
