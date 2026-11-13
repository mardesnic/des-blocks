import type { Difficulty } from './blocks';

export const LANGS = ['en', 'hr'] as const;
export type Lang = (typeof LANGS)[number];
export type Language = 'auto' | Lang;

// Each language's name in that language, for the picker.
export const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  hr: 'Hrvatski',
};

export function detectLang(): Lang {
  const preferred = navigator.languages ?? [navigator.language];
  return preferred.some((l) => l.toLowerCase().startsWith('hr')) ? 'hr' : 'en';
}

type Forms = { one: string; few?: string; other: string };

// Croatian has three plural forms: 1 potez, 2 poteza, 5 poteza.
const count = (lang: Lang, n: number, forms: Forms) => {
  const form = new Intl.PluralRules(lang).select(n) as keyof Forms;
  return `${n} ${forms[form] ?? forms.other}`;
};

const en = {
  title: 'Blocks',
  newGame: 'New game',
  settings: 'Settings',
  close: 'Close',
  levels: {
    tiny: 'Very easy',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  } as Record<Difficulty, string>,
  goal: 'Slide the blocks to get the star out',
  moves: (n: number) => count('en', n, { one: 'move', other: 'moves' }),
  star: 'Star block',
  block: 'Block',
  undo: 'Undo',
  clear: 'Start over',
  solved: 'Well done!',
  solvedIn: (n: number) =>
    `Out in ${count('en', n, { one: 'move', other: 'moves' })}`,
  next: 'Next',
  changeLevel: 'Change level',
  language: 'Language',
  automatic: 'Automatic',
  sound: 'Sound and vibration',
  on: 'On',
  off: 'Off',
  statistics: 'Statistics',
  solvedColumn: 'Solved',
  allGames: 'All games',
  source: 'Source',
  version: 'Version',
};

export type Strings = typeof en;

const hr: Strings = {
  title: 'Blokovi',
  newGame: 'Nova igra',
  settings: 'Postavke',
  close: 'Zatvori',
  levels: {
    tiny: 'Vrlo lagano',
    easy: 'Lagano',
    medium: 'Srednje',
    hard: 'Teško',
  },
  goal: 'Pomiči blokove da izvučeš zvijezdu',
  moves: (n: number) =>
    count('hr', n, { one: 'potez', few: 'poteza', other: 'poteza' }),
  star: 'Blok sa zvijezdom',
  block: 'Blok',
  undo: 'Poništi',
  clear: 'Ispočetka',
  solved: 'Bravo!',
  solvedIn: (n: number) =>
    `Vani u ${count('hr', n, { one: 'potezu', few: 'poteza', other: 'poteza' })}`,
  next: 'Dalje',
  changeLevel: 'Promijeni razinu',
  language: 'Jezik',
  automatic: 'Automatski',
  sound: 'Zvuk i vibracija',
  on: 'Uključeno',
  off: 'Isključeno',
  statistics: 'Statistika',
  solvedColumn: 'Riješeno',
  allGames: 'Sve igre',
  source: 'Izvorni kod',
  version: 'Verzija',
};

export const STRINGS: Record<Lang, Strings> = { en, hr };
