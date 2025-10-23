import React, { useEffect, useState } from 'react';
import { getAllColectivos, getAllUsers, getDailyBus, getSystemStats } from '../api/games';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'stats' | 'buses' | 'users' | 'daily'>('stats');
  const [systemStats, setSystemStats] = useState<any>(null);
  const [colectivos, setColectivos] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [dailyBus, setDailyBus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSystemStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'buses') loadColectivos();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'daily') loadDailyBus();
  }, [activeTab]);

  const loadSystemStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSystemStats();
      setSystemStats(data.stats);
    } catch (err: any) {
      setError('Error al cargar estadísticas del sistema');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadColectivos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllColectivos();
      setColectivos(data.colectivos);
    } catch (err: any) {
      setError('Error al cargar colectivos. Verifica que tengas permisos de administrador.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data.users);
    } catch (err: any) {
      setError('Error al cargar usuarios. Verifica que tengas permisos de administrador.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyBus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDailyBus();
      setDailyBus(data);
    } catch (err: any) {
      setError('Error al cargar bondi del día. Verifica que tengas permisos de administrador.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>🔧 Panel de Administración</h2>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, borderBottom: '2px solid #e0e0e0' }}>
          <button
            className={`btn ${activeTab === 'stats' ? 'celeste' : ''}`}
            onClick={() => setActiveTab('stats')}
            style={{ borderRadius: '8px 8px 0 0' }}
          >
            📊 Estadísticas
          </button>
          <button
            className={`btn ${activeTab === 'daily' ? 'celeste' : ''}`}
            onClick={() => setActiveTab('daily')}
            style={{ borderRadius: '8px 8px 0 0' }}
          >
            🎯 Bondi del Día
          </button>
          <button
            className={`btn ${activeTab === 'buses' ? 'celeste' : ''}`}
            onClick={() => setActiveTab('buses')}
            style={{ borderRadius: '8px 8px 0 0' }}
          >
            🚍 Colectivos
          </button>
          <button
            className={`btn ${activeTab === 'users' ? 'celeste' : ''}`}
            onClick={() => setActiveTab('users')}
            style={{ borderRadius: '8px 8px 0 0' }}
          >
            👥 Usuarios
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div style={{ 
            marginTop: 16, 
            padding: 12, 
            background: '#fee', 
            color: '#c33',
            borderRadius: 8,
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p>Cargando...</p>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <div style={{ marginTop: 24 }}>
            {/* Estadísticas del Sistema */}
            {activeTab === 'stats' && systemStats && (
              <div className="grid">
                <div className="col-4">
                  <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <div style={{ fontSize: 48, fontWeight: 'bold' }}>{systemStats.total_users}</div>
                    <div style={{ fontSize: 16, opacity: 0.9 }}>Usuarios Totales</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                    <div style={{ fontSize: 48, fontWeight: 'bold' }}>{systemStats.total_buses}</div>
                    <div style={{ fontSize: 16, opacity: 0.9 }}>Colectivos</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                    <div style={{ fontSize: 48, fontWeight: 'bold' }}>{systemStats.total_games}</div>
                    <div style={{ fontSize: 16, opacity: 0.9 }}>Juegos Jugados</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                    <div style={{ fontSize: 48, fontWeight: 'bold' }}>{systemStats.total_games_won}</div>
                    <div style={{ fontSize: 16, opacity: 0.9 }}>Juegos Ganados</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                    <div style={{ fontSize: 48, fontWeight: 'bold' }}>{systemStats.games_today}</div>
                    <div style={{ fontSize: 16, opacity: 0.9 }}>Juegos Hoy</div>
                  </div>
                </div>
              </div>
            )}

            {/* Bondi del Día */}
            {activeTab === 'daily' && dailyBus && (
              <div>
                <h3>🎯 Bondi del Día - {formatDate(dailyBus.date)}</h3>
                <div className="card" style={{ marginTop: 16, background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>
                    Colectivo #{dailyBus.bus.numero}
                  </div>
                  <div className="grid">
                    <div className="col-6">
                      <strong>Ramal:</strong> {dailyBus.bus.ramalNombre || '—'}
                    </div>
                    <div className="col-6">
                      <strong>Zona:</strong> {dailyBus.bus.zona || '—'}
                    </div>
                    <div className="col-6">
                      <strong>Inicio:</strong> {dailyBus.bus.inicio || '—'}
                    </div>
                    <div className="col-6">
                      <strong>Final:</strong> {dailyBus.bus.final || '—'}
                    </div>
                    <div className="col-6">
                      <strong>Año:</strong> {dailyBus.bus.anio_creacion || '—'}
                    </div>
                    <div className="col-6">
                      <strong>Empresas:</strong> {dailyBus.bus.empresas?.join(', ') || '—'}
                    </div>
                    <div className="col-12">
                      <strong>Colores:</strong> {dailyBus.bus.colores?.join(', ') || '—'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Colectivos */}
            {activeTab === 'buses' && (
              <div>
                <h3>🚍 Colectivos ({colectivos.length})</h3>
                <div style={{ maxHeight: 600, overflow: 'auto', marginTop: 16 }}>
                  {colectivos.map((bus) => (
                    <div key={bus.id_colectivo} className="card" style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: 18 }}>#{bus.numero}</strong>
                          <span style={{ marginLeft: 12, opacity: 0.7 }}>
                            {bus.zona} | {bus.total_ramales} ramales
                          </span>
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.6 }}>
                          Año: {bus.anio_creacion || '—'}
                        </div>
                      </div>
                      <div style={{ marginTop: 8, fontSize: 14 }}>
                        <div><strong>Empresas:</strong> {bus.empresas || '—'}</div>
                        <div><strong>Colores:</strong> {bus.colores || '—'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de Usuarios */}
            {activeTab === 'users' && (
              <div>
                <h3>👥 Usuarios ({users.length})</h3>
                <div style={{ maxHeight: 600, overflow: 'auto', marginTop: 16 }}>
                  {users.map((user) => (
                    <div key={user.id_usuario} className="card" style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: 16 }}>{user.nombre_usuario}</strong>
                          {user.es_admin === 1 && (
                            <span style={{ 
                              marginLeft: 8, 
                              padding: '2px 8px', 
                              background: '#667eea', 
                              color: 'white', 
                              borderRadius: 4,
                              fontSize: 12,
                              fontWeight: 'bold'
                            }}>
                              ADMIN
                            </span>
                          )}
                          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                            {user.email}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: 14 }}>
                          <div><strong>{user.total_games || 0}</strong> juegos</div>
                          <div style={{ color: '#48bb78' }}><strong>{user.games_won || 0}</strong> ganados</div>
                          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                            Registro: {formatDate(user.fecha_registro)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
