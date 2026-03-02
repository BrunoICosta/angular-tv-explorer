import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localePt from '@angular/common/locales/pt';
import {
  EnvironmentProviders,
  inject,
  isDevMode,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';

import { AVAILABLE_LANGS, DEFAULT_LANG } from './i18n.config';
import { LanguageService } from './language.service';
import { TranslocoHttpLoader } from './transloco-http.loader';

/** Locale data for the date/number pipes of every supported language. */
export function registerAppLocales(): void {
  registerLocaleData(localePt, 'pt-BR');
  registerLocaleData(localeEn, 'en-US');
}

/** Transloco + locale data + loading the detected language before the first render. */
export function provideI18n(): EnvironmentProviders {
  registerAppLocales();
  return makeEnvironmentProviders([
    provideTransloco({
      config: {
        availableLangs: [...AVAILABLE_LANGS],
        defaultLang: DEFAULT_LANG,
        fallbackLang: DEFAULT_LANG,
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        missingHandler: { useFallbackTranslation: true, logMissingKey: isDevMode() },
      },
      loader: TranslocoHttpLoader,
    }),
    provideAppInitializer(() => inject(LanguageService).init()),
  ]);
}
