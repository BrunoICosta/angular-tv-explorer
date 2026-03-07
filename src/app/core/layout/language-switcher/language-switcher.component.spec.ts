import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideTranslocoTesting } from '../../../../testing/transloco-testing';
import { LANG_STORAGE_KEY } from '../../i18n/i18n.config';
import { LanguageService } from '../../i18n/language.service';
import { BROWSER_STORAGE, MemoryStorage } from '../../storage/browser-storage.token';
import { LanguageSwitcherComponent } from './language-switcher.component';

describe('LanguageSwitcherComponent', () => {
  let fixture: ComponentFixture<LanguageSwitcherComponent>;
  let storage: MemoryStorage;

  const group = (): HTMLElement => fixture.nativeElement.querySelector('[role="radiogroup"]');
  const radio = (name: string): HTMLButtonElement =>
    fixture.nativeElement.querySelector(`[role="radio"][aria-label="${name}"]`);

  async function settle(): Promise<void> {
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    storage = new MemoryStorage();
    TestBed.configureTestingModule({
      imports: [LanguageSwitcherComponent],
      providers: [
        provideTranslocoTesting('pt-BR'),
        { provide: BROWSER_STORAGE, useValue: storage },
      ],
    });
    await TestBed.inject(LanguageService).init();
    fixture = TestBed.createComponent(LanguageSwitcherComponent);
    fixture.detectChanges();
  });

  it('is a labelled radio group with one flag per language, named in its own language', () => {
    const portuguese = radio('Português (Brasil)');
    const english = radio('English');

    expect(group().getAttribute('aria-label')).toBe('Idioma');
    expect(portuguese.getAttribute('aria-checked')).toBe('true');
    expect(portuguese.lang).toBe('pt-BR');
    expect(portuguese.title).toBe('Português (Brasil)');
    expect(portuguese.tabIndex).toBe(0);
    expect(english.getAttribute('aria-checked')).toBe('false');
    expect(english.lang).toBe('en');
    expect(english.tabIndex).toBe(-1);
    expect(english.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('switches language on click, persists it and relabels the group', async () => {
    radio('English').click();
    await settle();

    expect(TestBed.inject(LanguageService).lang()).toBe('en');
    expect(storage.getItem(LANG_STORAGE_KEY)).toBe('en');
    expect(group().getAttribute('aria-label')).toBe('Language');
    expect(radio('English').getAttribute('aria-checked')).toBe('true');
  });

  it('moves the selection and focus with the arrow keys', async () => {
    const portuguese = radio('Português (Brasil)');
    portuguese.focus();
    portuguese.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await settle();

    expect(TestBed.inject(LanguageService).lang()).toBe('en');
    expect(document.activeElement).toBe(radio('English'));
  });
});
