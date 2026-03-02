import { EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders } from '@angular/core';
import { Translation, TranslocoTestingModule } from '@jsverse/transloco';

import en from '../../public/i18n/en.json';
import ptBR from '../../public/i18n/pt-BR.json';
import {
  AVAILABLE_LANGS,
  AppLang,
  BROWSER_LANGUAGES,
  DEFAULT_LANG,
} from '../app/core/i18n/i18n.config';
import { registerAppLocales } from '../app/core/i18n/provide-i18n';

/** Feature scopes, registered as `<scope>/<lang>` so scoped keys resolve like in the app. */
const SCOPES: Record<string, Record<AppLang, Translation>> = {};

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
