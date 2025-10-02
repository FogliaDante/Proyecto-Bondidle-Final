import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export default function GameSelector() {
  const { t } = useI18n();
  return (
    <div className="container">
      <div className="card">
        <h2>{t('modes.title')}</h2>
        <p>{t('modes.desc')}</p>
        <div className="row" style={{ gap: 16, marginTop: 12 }}>
          <Link className="btn" to="/classic">{t('modes.classic')}</Link>
          <Link className="btn" to="/recorrido">{t('modes.recorrido')}</Link>
        </div>
      </div>
    </div>
  );
}
