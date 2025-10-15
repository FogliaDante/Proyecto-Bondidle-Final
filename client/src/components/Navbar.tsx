import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useI18n();

  return (
    <nav className="nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src="/icono.png" // Cambia esto por la ruta de tu imagen
          alt="Bondidle Icon"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px' // Opcional: redondear las esquinas
          }}
        />
        <h1>{t('app.title')}</h1>
      </div>
      <div style={{ flex: 1 }} />
      <Link to="/">{t('nav.home')}</Link>
      <Link to="/classic">{t('nav.classic')}</Link>
      <Link to="/recorrido">{t('nav.recorrido')}</Link>
      <div style={{ flex: 1 }} />
      <LanguageSwitcher />
      {user ? (
        <>
          <span style={{ opacity: .8 }}>{t('nav.hello', { name: user.nombre })}</span>
          <button className="btn" onClick={logout}>{t('nav.logout')}</button>
        </>
      ) : (
        <>
          <Link to="/login">{t('nav.login')}</Link>
          <Link to="/register">{t('nav.register')}</Link>
        </>
      )}
    </nav>
  );
}
