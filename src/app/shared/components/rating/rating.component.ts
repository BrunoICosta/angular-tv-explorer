import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-rating',
  imports: [IconComponent, DecimalPipe],
  template: `
    @if (value(); as rating) {
      <span class="rating" [attr.aria-label]="'Nota ' + (rating | number: '1.1-1') + ' de 10'">
        <app-icon name="star" [size]="14" [filled]="true" />
        {{ rating | number: '1.1-1' }}
      </span>
    } @else {
      <span class="rating rating--empty" aria-label="Sem nota">—</span>
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
}
