import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { apiRegister } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';

export default function RegisterForm() {
  const { t } = useI18n();
  const [nombre, setNombre] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, token } = useAuth(); const nav = useNavigate();

  // Si ya hay token, redirigir al home
  if (token) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    try {
      const { token, user } = await apiRegister({ nombre, email, password });
      login(user, token); nav('/');
    } catch { setError(t('error.register')); }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h2>{t('register.title')}</h2>
        {error && <p style={{ color: '#ff6b81' }}>{error}</p>}
        <form onSubmit={onSubmit}>
          <label>{t('register.name')}</label>
          <input className="input" value={nombre} onChange={e => setNombre(e.target.value)} />
          <label>{t('login.email')}</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <label>{t('login.password')}</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <div style={{ marginTop: 12 }}>
            <button className="btn" type="submit">{t('register.submit')}</button>
          </div>
        </form>
        <p style={{ marginTop: 12 }}>
          {t('register.haveAccount')} <Link to="/login">{t('register.toLogin')}</Link>
        </p>
      </div>
    </div>
  );
}
