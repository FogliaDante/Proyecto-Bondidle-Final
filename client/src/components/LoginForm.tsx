import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { apiLogin } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';

export default function LoginForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState<boolean>(false);
  const { login, token } = useAuth(); const nav = useNavigate();

  // Si ya hay token, redirigir al home
  if (token) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setHasError(false);
    try {
      const { token, user } = await apiLogin({ email, password });
      login(user, token); nav('/');
    } catch { 
      setHasError(true);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h2>{t('login.title')}</h2>
        {hasError && <p style={{ color: '#ff6b81' }}>{t('error.credentials')}</p>}
        <form onSubmit={onSubmit}>
          <label>{t('login.email')}</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <label>{t('login.password')}</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <div style={{ marginTop: 12 }}>
            <button className="btn" type="submit">{t('login.submit')}</button>
          </div>
        </form>
        <p style={{ marginTop: 12 }}>
          {t('login.noAccount')} <Link to="/register">{t('login.toRegister')}</Link>
        </p>
      </div>
    </div>
  );
}
