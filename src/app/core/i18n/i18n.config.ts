import { DOCUMENT, InjectionToken, inject } from '@angular/core';

export const AVAILABLE_LANGS = ['pt-BR', 'en'] as const;
export type AppLang = (typeof AVAILABLE_LANGS)[number];

export const DEFAULT_LANG: AppLang = 'pt-BR';
export const LANG_STORAGE_KEY = 'tv-explorer:lang';

/** Locale used by Angular's date/number pipes and `Intl` for each language. */
export const LOCALE_BY_LANG: Readonly<Record<AppLang, string>> = {
  'pt-BR': 'pt-BR',
  en: 'en-US',
};

/** Native name of each language: accessible name and tooltip of the switcher flags. */
export const LANG_LABELS: Readonly<Record<AppLang, string>> = {
  'pt-BR': 'Português (Brasil)',
  en: 'English',
};

export function isAppLang(value: unknown): value is AppLang {
  return typeof value === 'string' && (AVAILABLE_LANGS as readonly string[]).includes(value);
}

/** Maps a BCP 47 tag from the browser to a supported language (`pt*` → pt-BR, anything else → en). */
export function langFromBrowserTag(tag: string): AppLang {
  return tag.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en';
}

/** Saved choice > first browser language > pt-BR. */
export function detectInitialLang(saved: string | null, browserLangs: readonly string[]): AppLang {
  if (isAppLang(saved)) {
    return saved;
  }
  const preferred = browserLangs.find((tag) => !!tag);
  return preferred ? langFromBrowserTag(preferred) : DEFAULT_LANG;
}

/** Browser language preferences, injectable so tests can simulate other browsers. */
export const BROWSER_LANGUAGES = new InjectionToken<readonly string[]>('BROWSER_LANGUAGES', {
  providedIn: 'root',
  factory: () => {
    const navigator = inject(DOCUMENT).defaultView?.navigator;
    if (!navigator) {
      return [];
    }
    return navigator.languages?.length ? navigator.languages : [navigator.language];
  },
});
