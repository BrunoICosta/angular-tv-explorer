import { detectInitialLang, isAppLang, langFromBrowserTag } from './i18n.config';

describe('i18n config', () => {
  it('prefers a valid saved choice', () => {
    expect(detectInitialLang('en', ['pt-BR'])).toBe('en');
    expect(detectInitialLang('pt-BR', ['en-US'])).toBe('pt-BR');
  });

  it('ignores invalid saved values and falls back to the browser language', () => {
    expect(detectInitialLang('fr', ['en-GB'])).toBe('en');
    expect(detectInitialLang(null, ['pt-PT', 'en'])).toBe('pt-BR');
  });

  it('maps any pt* tag to pt-BR and anything else to en', () => {
    expect(langFromBrowserTag('pt')).toBe('pt-BR');
    expect(langFromBrowserTag('PT-br')).toBe('pt-BR');
    expect(langFromBrowserTag('es-AR')).toBe('en');
  });

  it('defaults to pt-BR without saved choice or browser info', () => {
    expect(detectInitialLang(null, [])).toBe('pt-BR');
  });

  it('validates supported languages', () => {
    expect(isAppLang('en')).toBeTrue();
    expect(isAppLang('pt')).toBeFalse();
    expect(isAppLang(42)).toBeFalse();
  });
});
