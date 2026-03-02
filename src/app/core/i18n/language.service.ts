import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { Observable, firstValueFrom, map } from 'rxjs';

import { BROWSER_STORAGE } from '../storage/browser-storage.token';
import {
  AVAILABLE_LANGS,
  AppLang,
  BROWSER_LANGUAGES,
  LANG_LABELS,
  LANG_STORAGE_KEY,
  LOCALE_BY_LANG,
  detectInitialLang,
} from './i18n.config';

/** Owns the active language: detection, persistence, `<html lang>` and the matching locale. */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);
  private readonly storage = inject(BROWSER_STORAGE);
  private readonly browserLangs = inject(BROWSER_LANGUAGES);
  private readonly document = inject(DOCUMENT);

  private readonly _lang = signal<AppLang>(this.detect());

  readonly lang = this._lang.asReadonly();
  /** Locale id for Angular pipes / Intl (`pt-BR`, `en-US`). */
  readonly locale = computed(() => LOCALE_BY_LANG[this._lang()]);
  readonly options = AVAILABLE_LANGS.map((code) => ({ code, label: LANG_LABELS[code] }));

  /** Loads the root translations of the detected language; used as an app initializer. */
  init(): Promise<void> {
    return firstValueFrom(this.apply(this._lang()));
  }

  /** Switches language once its translations are loaded, so the UI never shows raw keys. */
  setLanguage(lang: AppLang): Promise<void> {
    try {
      this.storage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Storage disabled: the choice just won't survive a reload.
    }
    return firstValueFrom(this.apply(lang));
  }

  private apply(lang: AppLang): Observable<void> {
    return this.transloco.load(lang).pipe(
      map(() => {
        this.transloco.setActiveLang(lang);
        this._lang.set(lang);
        this.document.documentElement.lang = lang;
      }),
    );
  }

  private detect(): AppLang {
    let saved: string | null = null;
    try {
      saved = this.storage.getItem(LANG_STORAGE_KEY);
    } catch {
      saved = null;
    }
    return detectInitialLang(saved, this.browserLangs);
  }
}
