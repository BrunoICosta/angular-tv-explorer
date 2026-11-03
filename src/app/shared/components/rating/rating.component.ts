import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { LanguageService } from '../../../core/i18n/language.service';

import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-rating',
  imports: [IconComponent, DecimalPipe, TranslocoPipe],
  template: `
    @if (value(); as rating) {
      @let formatted = rating | number: '1.1-1' : locale();
      <span class="rating" [attr.aria-label]="'common.rating' | transloco: { value: formatted }">
        <app-icon name="star" [size]="14" [filled]="true" />
        {{ formatted }}
      </span>
    } @else {
      <span class="rating rating--empty" [attr.aria-label]="'common.noRating' | transloco">–</span>
    }
  `,
  styles: `
    .rating {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: var(--radius-pill);
      background: rgb(11 13 18 / 85%);
      color: var(--color-rating);
      font-size: var(--text-xs);
      font-weight: 700;
      font-variant-numeric: tabular-nums;

      &--empty {
        color: var(--color-text-subtle);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingComponent {
  readonly value = input<number | null>(null);

  protected readonly locale = inject(LanguageService).locale;
}
