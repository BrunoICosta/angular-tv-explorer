import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';

import { provideTranslocoTesting } from '../../../testing/transloco-testing';
import { BROWSER_STORAGE, MemoryStorage } from '../storage/browser-storage.token';
import { BROWSER_LANGUAGES, LANG_STORAGE_KEY } from './i18n.config';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let storage: MemoryStorage;

  function setup(browserLangs: string[]): LanguageService {
    TestBed.configureTestingModule({
      providers: [
        provideTranslocoTesting(),
        { provide: BROWSER_STORAGE, useValue: storage },
        { provide: BROWSER_LANGUAGES, useValue: browserLangs },
      ],
    });
    return TestBed.inject(LanguageService);
  }

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  afterEach(() => {
    TestBed.inject(DOCUMENT).documentElement.lang = 'pt-BR';
  });

  it('detects English from the browser and applies it on init', async () => {
    const service = setup(['en-US', 'pt-BR']);

    await service.init();

    expect(service.lang()).toBe('en');
    expect(service.locale()).toBe('en-US');
    expect(TestBed.inject(TranslocoService).getActiveLang()).toBe('en');
    expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('en');
  });

  it('restores the saved language over the browser one', async () => {
    storage.setItem(LANG_STORAGE_KEY, 'pt-BR');
    const service = setup(['en-US']);

    await service.init();

    expect(service.lang()).toBe('pt-BR');
    expect(service.locale()).toBe('pt-BR');
  });

  it('switches, persists and updates <html lang>', async () => {
    const service = setup(['pt-BR']);
    await service.init();

    await service.setLanguage('en');

    expect(service.lang()).toBe('en');
    expect(storage.getItem(LANG_STORAGE_KEY)).toBe('en');
    expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('en');
    expect(TestBed.inject(TranslocoService).translate('nav.catalog')).toBe('Catalog');
  });
});
