import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  viewChildren,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import {
  FlagCode,
  FlagIconComponent,
} from '../../../shared/components/flag-icon/flag-icon.component';
import { AppLang } from '../../i18n/i18n.config';
import { LanguageService } from '../../i18n/language.service';

const FLAG_BY_LANG: Readonly<Record<AppLang, FlagCode>> = { 'pt-BR': 'br', en: 'us' };

const ARROW_STEPS: Readonly<Record<string, number>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/**
 * Flag radio group (a native `<select>` can't render SVG). Each option is named in its own
 * language, only the checked option is tabbable and arrow keys move the selection (WAI-ARIA
 * radio group pattern).
 */
@Component({
  selector: 'app-language-switcher',
  imports: [TranslocoPipe, FlagIconComponent],
  template: `
    <div class="switcher" role="radiogroup" [attr.aria-label]="'language.label' | transloco">
      @for (option of languages.options; track option.code; let i = $index) {
        @let checked = option.code === languages.lang();
        <button
          #option
          type="button"
          role="radio"
          class="switcher__option"
          [class.switcher__option--active]="checked"
          [attr.aria-checked]="checked"
          [attr.aria-label]="option.label"
          [title]="option.label"
          [lang]="option.code"
          [tabIndex]="checked ? 0 : -1"
          (click)="select(option.code)"
          (keydown)="onKeydown($event, i)"
        >
          <app-flag-icon [code]="flags[option.code]" />
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    .switcher {
      display: inline-flex;
      gap: 2px;
      padding: 2px;
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-pill);
      background: var(--color-surface);
    }

    .switcher__option {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      padding: 0;
      border: 0;
      border-radius: var(--radius-pill);
      background: transparent;
      cursor: pointer;
      opacity: 0.55;
      filter: grayscale(0.7);
      transition:
        opacity var(--transition-fast),
        filter var(--transition-fast),
        background var(--transition-fast);

      &:hover,
      &:focus-visible {
        opacity: 1;
        filter: none;
      }

      &:hover {
        background: var(--color-surface-2);
      }

      &--active {
        opacity: 1;
        filter: none;
        background: var(--color-accent-soft);
        box-shadow: inset 0 0 0 2px var(--color-accent);
      }

      &:focus-visible {
        border-radius: var(--radius-pill);
        box-shadow: var(--focus-ring);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  protected readonly languages = inject(LanguageService);
  protected readonly flags = FLAG_BY_LANG;
  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('option');

  protected select(lang: AppLang): void {
    if (lang !== this.languages.lang()) {
      void this.languages.setLanguage(lang);
    }
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const step = ARROW_STEPS[event.key];
    if (!step) {
      return;
    }
    event.preventDefault();
    const options = this.languages.options;
    const next = (index + step + options.length) % options.length;
    this.select(options[next].code);
    this.buttons()[next]?.nativeElement.focus();
  }
}
