import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideTranslocoTesting } from '../../../../testing/transloco-testing';
import { LANG_STORAGE_KEY } from '../../i18n/i18n.config';
import { LanguageService } from '../../i18n/language.service';
import { BROWSER_STORAGE, MemoryStorage } from '../../storage/browser-storage.token';
import { LanguageSwitcherComponent } from './language-switcher.component';

describe('LanguageSwitcherComponent', () => {
  let fixture: ComponentFixture<LanguageSwitcherComponent>;
  let storage: MemoryStorage;
  let select: HTMLSelectElement;

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
    select = fixture.nativeElement.querySelector('select');
  });

  it('has an accessible label and shows the current language', () => {
    const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');

    expect(label.htmlFor).toBe(select.id);
    expect(label.textContent?.trim()).toBe('Idioma');
    expect(select.value).toBe('pt-BR');
    expect([...select.options].map((o) => o.textContent?.trim())).toEqual(['Português', 'English']);
  });

  it('switches language and relabels itself', async () => {
    select.value = 'en';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(TestBed.inject(LanguageService).lang()).toBe('en');
    expect(storage.getItem(LANG_STORAGE_KEY)).toBe('en');
    expect(fixture.nativeElement.querySelector('label').textContent.trim()).toBe('Language');
  });
});
