import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { isAppLang } from '../../i18n/i18n.config';
import { LanguageService } from '../../i18n/language.service';

/** Native `<select>`: keyboard and screen-reader friendly, always shows the current language. */
@Component({
  selector: 'app-language-switcher',
  imports: [TranslocoPipe],
  template: `
    <label class="visually-hidden" for="language-switcher">{{
      'language.label' | transloco
    }}</label>
    <select
      id="language-switcher"
      class="switcher"
      [title]="'language.label' | transloco"
      (change)="onChange($event)"
    >
      @for (option of languages.options; track option.code) {
        <option
          [value]="option.code"
          [selected]="option.code === languages.lang()"
          [lang]="option.code"
        >
          {{ option.label }}
        </option>
      }
    </select>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    .switcher {
      min-height: 36px;
      max-width: 9.5rem;
      padding: 0 var(--space-3);
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-pill);
      background: var(--color-surface);
      font-size: var(--text-sm);
      font-weight: 600;
      cursor: pointer;

      &:hover {
        border-color: var(--color-text-subtle);
      }

      &:focus-visible {
        border-radius: var(--radius-pill);
      }

      option {
        background: var(--color-surface);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  protected readonly languages = inject(LanguageService);

  protected onChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (isAppLang(value)) {
      void this.languages.setLanguage(value);
    }
  }
}
