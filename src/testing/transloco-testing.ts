import { EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders } from '@angular/core';
import { Translation, TranslocoTestingModule } from '@jsverse/transloco';

import en from '../../public/i18n/en.json';
import ptBR from '../../public/i18n/pt-BR.json';
import catalogEn from '../../public/i18n/catalog/en.json';
import catalogPt from '../../public/i18n/catalog/pt-BR.json';
import favoritesEn from '../../public/i18n/favorites/en.json';
import favoritesPt from '../../public/i18n/favorites/pt-BR.json';
import scheduleEn from '../../public/i18n/schedule/en.json';
import schedulePt from '../../public/i18n/schedule/pt-BR.json';
import searchEn from '../../public/i18n/search/en.json';
import searchPt from '../../public/i18n/search/pt-BR.json';
import detailEn from '../../public/i18n/show-detail/en.json';
import detailPt from '../../public/i18n/show-detail/pt-BR.json';
import {
  AVAILABLE_LANGS,
  AppLang,
  BROWSER_LANGUAGES,
  DEFAULT_LANG,
} from '../app/core/i18n/i18n.config';
import { registerAppLocales } from '../app/core/i18n/provide-i18n';

/** Feature scopes, registered as `<scope>/<lang>` so scoped keys resolve like in the app. */
const SCOPES: Record<string, Record<AppLang, Translation>> = {
  catalog: { 'pt-BR': catalogPt, en: catalogEn },
  favorites: { 'pt-BR': favoritesPt, en: favoritesEn },
  schedule: { 'pt-BR': schedulePt, en: scheduleEn },
  search: { 'pt-BR': searchPt, en: searchEn },
  'show-detail': { 'pt-BR': detailPt, en: detailEn },
};

/**
 * Real translation files, preloaded synchronously, for component tests. The browser language is
 * pinned to `lang` so LanguageService (locale for pipes) agrees with the active Transloco lang.
 */
export function provideTranslocoTesting(lang: AppLang = DEFAULT_LANG): EnvironmentProviders {
  registerAppLocales();
  const langs: Record<string, Translation> = { 'pt-BR': ptBR, en };
  for (const [scope, files] of Object.entries(SCOPES)) {
    for (const [code, translation] of Object.entries(files)) {
      langs[`${scope}/${code}`] = translation;
    }
  }
  return makeEnvironmentProviders([
    { provide: BROWSER_LANGUAGES, useValue: [lang] },
    importProvidersFrom(
      TranslocoTestingModule.forRoot({
        langs,
        preloadLangs: true,
        translocoConfig: {
          availableLangs: [...AVAILABLE_LANGS],
          defaultLang: lang,
          fallbackLang: DEFAULT_LANG,
          reRenderOnLangChange: true,
          missingHandler: { logMissingKey: false, useFallbackTranslation: true, allowEmpty: false },
        },
      }),
    ),
  ]);
}
