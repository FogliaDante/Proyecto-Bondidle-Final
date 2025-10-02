import React, { createContext, useContext, useMemo, useState } from 'react';

type Lang = 'es' | 'en';
type Dict = Record<string, string>;

const resources: Record<Lang, Dict> = {
  es: {
    // Navbar
    'app.title': 'Bondidle',
    'nav.home': 'Inicio',
    'nav.classic': 'Clásico',
    'nav.recorrido': 'Recorrido',
    'nav.login': 'Ingresar',
    'nav.register': 'Registro',
    'nav.logout': 'Salir',
    'nav.hello': 'Hola, {{name}}',

    // Selector de juegos
    'modes.title': 'Modos de Juego',
    'modes.desc': 'Aprendé jugando sobre líneas, ramales, terminales, colores y empresas.',
    'modes.classic': 'Modo Clásico (Wordle)',
    'modes.recorrido': 'Recorrido (imagen)',

    // Login/Register
    'login.title': 'Iniciar sesión',
    'login.email': 'Email',
    'login.password': 'Contraseña',
    'login.submit': 'Entrar',
    'login.noAccount': '¿No tenés cuenta?',
    'login.toRegister': 'Registrate',
    'error.credentials': 'Error de credenciales',
    'register.title': 'Crear cuenta',
    'register.name': 'Nombre',
    'register.submit': 'Registrarme',
    'register.haveAccount': '¿Ya tenés cuenta?',
    'register.toLogin': 'Entrá',
    'error.register': 'No se pudo registrar',

    // Clásico
    'classic.title': 'Modo Clásico (Wordle) — {{date}}',
    'classic.searchNumber': 'Buscar número (ej: 110)',
    'classic.numberPlaceholder': 'Número de colectivo',
    'classic.branchLabel': 'Ramal',
    'classic.anyBranch': '— Cualquier ramal —',
    'classic.try': 'Probar',
    'classic.attempts': 'Intentos',
    'classic.noAttempts': 'Aún no hay intentos.',

    // Encabezados de columnas del juego clásico
    'classic.header.number': 'Número',
    'classic.header.branch': 'Ramal',
    'classic.header.company': 'Empresa',
    'classic.header.colors': 'Colores',
    'classic.header.startTerminal': 'Terminal Inicio',
    'classic.header.endTerminal': 'Terminal Final',
    'classic.header.zone': 'Zona',
    'classic.header.year': 'Año',

    // Hints (claves internas)
    'hints.number_diff': 'El número es diferente.',
    'hints.ramal_mismatch_after_num': 'Adivinaste el número, pero el ramal no.',
    'hints.colors_partial': 'Uno o más colores coinciden.',
    'hints.company_partial': 'Comparte empresa con el correcto.',
    'hints.terminal_similar': 'Una de las terminales es similar.',
    'hints.zone_diff': 'Zona distinta (CABA/Provincia/AMBA).',
    'hints.year_newer': 'El correcto es más nuevo.',
    'hints.year_older': 'El correcto es más viejo.',

    'route.title': 'Recorrido — Adiviná por la imagen',
    'route.alt': 'Recorrido',
    'route.noImage': 'No hay imagen disponible.',
    'route.numberLabel': 'Número',
    'route.branchLabel': 'Ramal',
    'route.numberPlaceholder': 'Ej: 110',
    'route.branchPlaceholder': 'Ej: A',
    'route.submit': 'Responder',
    'route.anotherImage': 'Otra imagen',
    'route.correct': '¡Correcto!',
    'route.incorrect': 'Incorrecto',

    // Zona
    'zone.CABA': 'CABA',
    'zone.Provincia': 'Provincia',
    'zone.AMBA': 'AMBA',
  },

  en: {
    // Navbar
    'app.title': 'Bondidle',
    'nav.home': 'Home',
    'nav.classic': 'Classic',
    'nav.recorrido': 'Route',
    'nav.login': 'Log in',
    'nav.register': 'Sign up',
    'nav.logout': 'Log out',
    'nav.hello': 'Hi, {{name}}',

    // Selector de juegos
    'modes.title': 'Game Modes',
    'modes.desc': 'Learn lines, branches, terminals, colors and companies by playing.',
    'modes.classic': 'Classic (Wordle-like)',
    'modes.recorrido': 'Route (image)',

    // Login/Register
    'login.title': 'Sign in',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.submit': 'Enter',
    'login.noAccount': "Don't have an account?",
    'login.toRegister': 'Sign up',
    'error.credentials': 'Invalid credentials',
    'register.title': 'Create account',
    'register.name': 'Name',
    'register.submit': 'Sign up',
    'register.haveAccount': 'Already have an account?',
    'register.toLogin': 'Sign in',
    'error.register': "Couldn't sign up",

    // Clásico
    'classic.title': 'Classic (Wordle) — {{date}}',
    'classic.searchNumber': 'Search number (e.g., 110)',
    'classic.numberPlaceholder': 'Bus number',
    'classic.branchLabel': 'Branch',
    'classic.anyBranch': '— Any branch —',
    'classic.try': 'Try',
    'classic.attempts': 'Attempts',
    'classic.noAttempts': 'No attempts yet.',

    // Column headers for classic game
    'classic.header.number': 'Number',
    'classic.header.branch': 'Branch',
    'classic.header.company': 'Company',
    'classic.header.colors': 'Colors',
    'classic.header.startTerminal': 'Start Terminal',
    'classic.header.endTerminal': 'End Terminal',
    'classic.header.zone': 'Zone',
    'classic.header.year': 'Year',

    // Hints
    'hints.number_diff': 'The number is different.',
    'hints.ramal_mismatch_after_num': 'You guessed the number, but not the branch.',
    'hints.colors_partial': 'One or more colors match.',
    'hints.company_partial': 'Shares a company with the correct one.',
    'hints.terminal_similar': 'One terminal is similar.',
    'hints.zone_diff': 'Different zone (CABA/Province/AMBA).',
    'hints.year_newer': 'The correct one is newer.',
    'hints.year_older': 'The correct one is older.',

    'route.title': 'Route — Guess by the image',
    'route.alt': 'Route',
    'route.noImage': 'No image available.',
    'route.numberLabel': 'Number',
    'route.branchLabel': 'Branch',
    'route.numberPlaceholder': 'Ex: 60',
    'route.branchPlaceholder': 'Ex: A',
    'route.submit': 'Submit',
    'route.anotherImage': 'Another image',
    'route.correct': 'Correct!',
    'route.incorrect': 'Incorrect',

    // Zona
    'zone.CABA': 'CABA',
    'zone.Provincia': 'Province',
    'zone.AMBA': 'AMBA',
  }
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  trHintKeyFromText: (txt: string) => string; // mapea frases existentes a claves
};

const I18nContext = createContext<Ctx>({
  lang: 'es', setLang: () => { },
  t: (k) => k,
  trHintKeyFromText: (s) => s,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'es');
  const setLang = (l: Lang) => { localStorage.setItem('lang', l); setLangState(l); };

  const t = (key: string, vars: Record<string, string | number> = {}) => {
    const dict = resources[lang] || {};
    let out = dict[key] ?? key;
    for (const k of Object.keys(vars)) {
      out = out.replaceAll(`{{${k}}}`, String(vars[k]));
    }
    return out;
  };

  // Mapea textos de HINT que hoy vienen en español desde el backend → claves
  const trHintKeyFromText = (txt: string) => {
    const map: Record<string, string> = {
      'El número es diferente.': 'hints.number_diff',
      'Adivinaste el número, pero el ramal no.': 'hints.ramal_mismatch_after_num',
      'Uno o más colores coinciden.': 'hints.colors_partial',
      'Comparte empresa con el correcto.': 'hints.company_partial',
      'Una de las terminales es similar.': 'hints.terminal_similar',
      'Zona distinta (CABA/Provincia/AMBA).': 'hints.zone_diff',
      'El correcto es más nuevo.': 'hints.year_newer',
      'El correcto es más viejo.': 'hints.year_older',
    };
    return map[txt] || txt; // si no la reconoce, devuelve el texto tal cual
  };

  const value = useMemo(() => ({ lang, setLang, t, trHintKeyFromText }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
