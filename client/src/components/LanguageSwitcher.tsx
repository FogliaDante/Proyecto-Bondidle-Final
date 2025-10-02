import React from 'react';
import { useI18n } from '../i18n';

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as any)}
      className="input"
      style={{ width: 120, padding: 6 }}
      aria-label="Language"
      title="Language"
    >
      <option value="es">Español</option>
      <option value="en">English</option>
    </select>
  );
}
